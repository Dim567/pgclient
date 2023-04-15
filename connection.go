package main

import (
	"context"
	"fmt"
	"os"

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
		return nil, fmt.Errorf("no such db")
	}

	if server.databases[dbName].connPool != nil {
		return server.databases[dbName].connPool, nil
	}

	// this doesn't return error if credentials wrong for some reason( need to investigate)
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
	// rows, err := connPool.Query(
	// 	server.ctx,
	// 	`SELECT * FROM pg_catalog.pg_tables
	// 	WHERE schemaname != 'pg_catalog'
	// 		AND schemaname != 'information_schema'
	// 		AND tableowner = $1`,
	// 	dbName,
	// )

	rows, err := connPool.Query(
		server.ctx,
		`SELECT * FROM pg_catalog.pg_tables
		WHERE tableowner = $1 AND schemaname = $2;`,
		dbName,
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
		WHERE schema_name NOT IN  ('information_schema', 'pg_catalog', 'pg_toast');`,
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

// TODO: add data about foreign, primary keys, NULL, default values ...
func (server *DbServer) DescribeTable(dbName, tableName string) ([]any, error) {
	connPool, err := server.getDbConnection(dbName)
	if err != nil {
		return nil, err
	}
	description, err := connPool.Query(
		server.ctx,
		`SELECT
			column_name,
			data_type
		FROM information_schema.columns
		WHERE table_name = $1;`,
		tableName,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
		return nil, err
	}

	defer description.Close()

	var res []any

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

func (server *DbServer) ExecuteQuery(dbName, query string) ([][]string, error) {
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

	rows, err := connPool.Query(
		server.ctx,
		query,
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

	return data, nil
}
