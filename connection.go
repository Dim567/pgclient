package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DbName = string
type DbServerName = string

type ConnectionSettings struct {
	Name,
	Host,
	Port,
	User,
	Password string
}

type DbServer struct {
	ctx       context.Context
	name      DbServerName
	settings  ConnectionSettings
	databases map[DbName]*DbConnection
}

type DbConnection struct {
	dbName   DbName
	dbCreds  string
	connPool *pgxpool.Pool
}

type QueryResult struct {
	Data           [][]string
	RequestType    string
	SuccessMessage string
}

func NewDbServer(ctx context.Context, name, host, port, user, password string) *DbServer {
	connectionSettings := ConnectionSettings{
		name,
		host,
		port,
		user,
		password,
	}

	databases := make(map[DbName]*DbConnection)

	return &DbServer{
		ctx,
		name,
		connectionSettings,
		databases,
	}
}

func (server *DbServer) SetDatabases(connectionName, host, port, user, password string) error {
	connString := fmt.Sprintf("postgres://%s:%s@%s:%s", user, password, host, port)

	// this doesn't return error if credentials wrong for some reason( need to investigate)
	// seems like actual connection happens only when we make a query request
	connPool, err := pgxpool.New(
		server.ctx,
		connString,
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		return err
	}
	defer connPool.Close()

	rows, err := connPool.Query(
		server.ctx,
		"SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres';",
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var dbName string
		err = rows.Scan(&dbName)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Rows scan failed: %v\n", err)
			return err
		}
		server.databases[dbName] = &DbConnection{
			dbName:  dbName,
			dbCreds: connString + "/" + dbName,
		}
	}

	return nil
}

// TODO: close db connection pool when db is not active from UI perspective to avoid resources consumption?
func (server *DbServer) getDbConnection(dbName string) (*pgxpool.Pool, error) {
	if len(dbName) == 0 {
		return nil, fmt.Errorf("db name can't be empty")
	}

	if _, ok := server.databases[dbName]; !ok {
		return nil, fmt.Errorf("Database '%s' does not exist on the server '%s'", dbName, server.name)
	}

	if server.databases[dbName].connPool != nil {
		return server.databases[dbName].connPool, nil
	}

	// this doesn't return error if credentials wrong for some reason (need to investigate)
	// seems like actual connection happens only when we make a query request
	dbConnPool, err := pgxpool.New(
		server.ctx,
		server.databases[dbName].dbCreds,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		return nil, err
	}

	err = dbConnPool.Ping(server.ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Connection error: %v\n", err)
		return nil, err
	}
	server.databases[dbName].connPool = dbConnPool
	return dbConnPool, nil
}

func (server *DbServer) GetDbTables(dbName, schemaName string) ([]string, error) {
	connPool, err := server.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}

	rows, err := connPool.Query(
		server.ctx,
		`SELECT * FROM pg_catalog.pg_tables
		WHERE tableowner = $1 AND schemaname = $2;`,
		server.settings.User,
		schemaName,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var tables []string

	for rows.Next() {
		var schemaName,
			tableName,
			dbName string

		err = rows.Scan(
			&schemaName,
			&tableName,
			&dbName,
			nil, nil, nil, nil, nil,
		)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Rows scan failed: %v\n", err)
			return nil, err
		}

		tables = append(tables, tableName)
	}

	return tables, nil
}

func (server *DbServer) GetDbSchemas(dbName string) ([]string, error) {
	connPool, err := server.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}

	rows, err := connPool.Query(
		server.ctx,
		`SELECT schema_name FROM information_schema.schemata
		WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast');`,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var schemas []string

	for rows.Next() {
		var schemaName string

		err = rows.Scan(&schemaName)

		if err != nil {
			fmt.Fprintf(os.Stderr, "Rows scan failed: %v\n", err)
			return nil, err
		}

		schemas = append(schemas, schemaName)
	}

	return schemas, nil
}

func (server *DbServer) DescribeTable(dbName, schemaName, tableName string) ([]any, error) {
	connPool, err := server.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}
	description, err := connPool.Query(
		server.ctx,
		`SELECT
			column_name,
			udt_name,
			data_type,
			column_default,
			is_nullable,
			character_maximum_length,
			numeric_precision,
			datetime_precision
		FROM information_schema.columns
		WHERE table_schema = $1 AND table_name = $2;`,
		schemaName,
		tableName,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return nil, err
	}

	defer description.Close()

	var res []any

	var columnNames []string
	for _, fieldDescription := range description.FieldDescriptions() {
		columnNames = append(columnNames, fieldDescription.Name)
	}

	res = append(res, columnNames)

	for description.Next() {
		values, err := description.Values()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Rows scan failed: %v\n", err)
			return nil, err
		}
		res = append(res, values)
	}

	return res, nil
}

func (server *DbServer) GetTableKeys(dbName, schemaName, tableName string) ([]any, error) {
	connPool, err := server.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}

	tableKeys, err := connPool.Query(
		server.ctx,
		`SELECT
					CASE
							WHEN (pgc.contype = 'c') THEN 'check_constraint'
							WHEN (pgc.contype = 'f') THEN 'foreign_key'
							WHEN (pgc.contype = 'p') THEN 'primary_key'
							WHEN (pgc.contype = 'u') THEN 'unique_key'
							ELSE 'other_constraint' END as constraint_type,
					pgc.conname as constraint_name,
					ccu.table_schema AS table_schema,
					kcu.table_name as table_name,
					CASE WHEN (pgc.contype = 'f') THEN kcu.COLUMN_NAME ELSE ccu.COLUMN_NAME END as column_name,
					CASE WHEN (pgc.contype = 'f') THEN ccu.TABLE_NAME ELSE (null) END as reference_table,
					CASE WHEN (pgc.contype = 'f') THEN ccu.COLUMN_NAME ELSE (null) END as reference_col,
					CASE WHEN (pgc.contype = 'p') THEN 'yes' ELSE 'no' END as auto_inc,
					CASE WHEN (pgc.contype = 'p') THEN 'NO' ELSE 'YES' END as is_nullable,

							'integer' as data_type,
							'0' as numeric_scale,
							'32' as numeric_precision
			FROM
					pg_constraint AS pgc
					JOIN pg_namespace nsp ON nsp.oid = pgc.connamespace
					JOIN pg_class cls ON pgc.conrelid = cls.oid
					JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = pgc.conname
					LEFT JOIN information_schema.constraint_column_usage ccu ON pgc.conname = ccu.CONSTRAINT_NAME
					AND nsp.nspname = ccu.CONSTRAINT_SCHEMA
			WHERE
					ccu.table_schema = $1
					AND kcu.table_name = $2

		ORDER BY table_name desc`,
		schemaName,
		tableName,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return nil, err
	}

	defer tableKeys.Close()

	var res []any

	var columnNames []string
	for _, fieldDescription := range tableKeys.FieldDescriptions() {
		columnNames = append(columnNames, fieldDescription.Name)
	}

	res = append(res, columnNames)

	for tableKeys.Next() {
		values, err := tableKeys.Values()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Rows scan failed: %v\n", err)
			return nil, err
		}
		res = append(res, values)
	}

	return res, nil
}

func (server *DbServer) ExecuteQuery(dbName, query string) (*QueryResult, error) {
	if len(dbName) == 0 {
		return nil, fmt.Errorf("db for the query is not specified")
	}

	if len(query) == 0 {
		return nil, fmt.Errorf("query can't be empty")
	}
	connPool, err := server.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}

	cleanQuery := strings.Trim(query, " ")
	cleanQuery = strings.ToLower(cleanQuery)

	index := strings.Index(cleanQuery, " ")
	if index == -1 {
		return nil, fmt.Errorf("wrong query")
	}

	command := cleanQuery[0:index]
	commands := []string{"insert", "update", "delete", "create", "drop", "truncate", "alter"}
	var requestType string = ""

	for _, item := range commands {
		if command == item {
			requestType = strings.ToUpper(item[:1]) + item[1:]
			break
		}
	}

	if len(requestType) != 0 {
		_, err = connPool.Exec(server.ctx, query)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
			return nil, err
		}

		var data [][]string
		result := QueryResult{
			Data:           data,
			RequestType:    requestType,
			SuccessMessage: fmt.Sprintf("%s request completed successfully", requestType),
		}
		return &result, nil
	}

	rows, err := connPool.Query(
		server.ctx,
		cleanQuery,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var data [][]string
	var columnNames []string
	for _, description := range rows.FieldDescriptions() {
		columnNames = append(columnNames, description.Name)
	}

	data = append(data, columnNames)

	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Rows scan failed: %v\n", err)
			return nil, err
		}
		var columnValues []string
		for _, value := range values {
			columnValues = append(columnValues, fmt.Sprint(value))
		}

		data = append(data, columnValues)
	}

	result := QueryResult{
		Data:           data,
		RequestType:    "Select or unknown",
		SuccessMessage: fmt.Sprintf("Request completed successfully"),
	}

	return &result, nil
}

func (server *DbServer) CloseConnections() {
	for _, dbConnection := range server.databases {
		dbConnection.connPool.Close()
	}
}
