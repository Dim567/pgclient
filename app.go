package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"

	"github.com/jackc/pgx/v5/pgxpool"
)

// App struct
type App struct {
	ctx       context.Context
	dbServers map[DbServerName]*DbServer
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

const CREDENTIALS_DIR = "connections"

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (app *App) startup(ctx context.Context) {
	app.ctx = ctx
	app.dbServers = make(map[DbServerName]*DbServer)
}

func (app *App) shutdown(ctx context.Context) {
	for _, dbServer := range app.dbServers {
		databases := dbServer.databases
		for _, db := range databases {
			if db.connPool != nil {
				db.connPool.Close()
			}
		}
	}
}

func (app *App) InitConnections() {
	connections := app.getExistingConnections()
	for _, conn := range connections {
		app.SetDbServer(conn.Name, conn.Host, conn.Port, conn.User, conn.Password)
	}
}

func (app *App) PingConnection(host, port, user, password string) error {
	connString := fmt.Sprintf("postgres://%s:%s@%s:%s", user, password, host, port)

	// this doesn't return error if credentials wrong for some reason( need to investigate)
	// seems like actual connection happens only when we make a query request
	connPool, err := pgxpool.New(
		app.ctx,
		connString,
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		return err
	}
	defer connPool.Close()

	return connPool.Ping(app.ctx)
}

func (app *App) SaveConnectionSettings(name, host, port, user, password string) error {
	if len(name) == 0 || len(host) == 0 || len(port) == 0 || len(user) == 0 || len(password) == 0 {
		return fmt.Errorf("settings fields can not be empty")
	}

	connSettings := ConnectionSettings{
		name,
		host,
		port,
		user,
		password,
	}

	settingsJson, err := json.Marshal(connSettings)
	if err != nil {
		return err
	}

	dirName := CREDENTIALS_DIR
	fileName := name + ".conn"
	err = os.MkdirAll(dirName, fs.ModePerm)
	if err != nil {
		return err
	}
	filePath := filepath.Join(dirName, fileName)
	err = os.WriteFile(filePath, settingsJson, fs.ModePerm)
	if err != nil {
		return err
	}

	return nil
}

func (app *App) getExistingConnections() []ConnectionSettings {
	// read files from disk and fill in respective structures
	dirName := CREDENTIALS_DIR
	stat, err := os.Stat(dirName)
	if err != nil && os.IsNotExist(err) {
		return nil
	}

	if !stat.IsDir() {
		return nil
	}

	files, _ := os.ReadDir(dirName)
	var settings []ConnectionSettings
	for _, file := range files {
		if !file.IsDir() {
			data, err := os.ReadFile(filepath.Join(dirName, file.Name()))
			if err != nil {
				return nil // TODO: error logout
			}
			var connection ConnectionSettings
			err = json.Unmarshal(data, &connection)
			if err != nil {
				return nil
			}
			settings = append(settings, connection)
		}
	}

	return settings
}

func (app *App) GetConnectionSettings(serverName string) ConnectionSettings {
	return app.dbServers[serverName].settings
}

func (app *App) SetDbServer(name, host, port, user, password string) {
	if _, ok := app.dbServers[name]; ok {
		for _, db := range app.dbServers[name].databases {
			if db.connPool != nil {
				db.connPool.Close()
			}
		}
		// TODO: cancel all running queries
	}

	dbServer := NewDbServer(app.ctx, name, host, port, user, password)
	app.dbServers[dbServer.name] = dbServer
}

func (app *App) GetConnectionsNames() []string {
	connNames := make([]string, 0)
	for name := range app.dbServers {
		connNames = append(connNames, name)
	}
	sort.Strings(connNames)
	return connNames
}

func (app *App) GetServerDatabases(serverName string) ([]string, error) {
	dbServer := app.dbServers[serverName]
	if dbServer == nil {
		return nil, fmt.Errorf("connection with name " + serverName + "doe not exist")
	}

	err := dbServer.SetDatabases(
		dbServer.settings.Name,
		dbServer.settings.Host,
		dbServer.settings.Port,
		dbServer.settings.User,
		dbServer.settings.Password,
	)

	if err != nil {
		return nil, err
	}

	dbNames := make([]string, 0, len(dbServer.databases))

	for dbName := range dbServer.databases {
		dbNames = append(dbNames, dbName)
	}

	sort.Strings(dbNames)
	return dbNames, nil
}

func (app *App) GetServerDbTables(serverName, dbName, schemaName string) ([]string, error) {
	dbServer := app.dbServers[serverName]
	tables, err := dbServer.GetDbTables(dbName, schemaName)
	if err != nil {
		return nil, err
	}
	return tables, nil
}

func (app *App) GetServerDbSchemas(serverName, dbName string) ([]string, error) {
	dbServer := app.dbServers[serverName]
	schemas, err := dbServer.GetDbSchemas(dbName)
	if err != nil {
		return nil, err
	}
	return schemas, nil
}

func (app *App) ExecuteQuery(serverName, dbName, query string) ([][]string, error) {
	dbServer := app.dbServers[serverName] // TODO: check for server existance, also serverName should not be ''
	data, err := dbServer.ExecuteQuery(dbName, query)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (app *App) GetTableStructure(serverName, dbName, schemaName, tableName string) ([]any, error) {
	dbServer := app.dbServers[serverName]
	data, err := dbServer.DescribeTable(dbName, schemaName, tableName)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (app *App) GetTableKeys(serverName, dbName, schemaName, tableName string) ([]any, error) {
	dbServer := app.dbServers[serverName]
	data, err := dbServer.GetTableKeys(dbName, schemaName, tableName)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (app *App) DeleteServer(serverName string) error {
	dbServer, ok := app.dbServers[serverName]
	if !ok {
		return fmt.Errorf("%s server does not exist", serverName)
	}

	dbServer.CloseConnections()
	delete(app.dbServers, serverName)

	// delete database server creds from disk
	dirName := CREDENTIALS_DIR
	fileName := serverName + ".conn"
	filePath := filepath.Join(dirName, fileName)

	if os.Remove(filePath) != nil {
		return fmt.Errorf("no creds file for the server %s", serverName)
	}

	return nil
}
