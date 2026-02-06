using MySql.Data.MySqlClient;
using System;

namespace Logger.Services
{
    public class DatabaseInitializationService
    {
        private readonly string _connectionString;

        public DatabaseInitializationService()
        {
            _connectionString =
    $"Server={Environment.GetEnvironmentVariable("DB_HOST")};" +
    $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
    $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
    $"User={Environment.GetEnvironmentVariable("DB_USERNAME")};" +
    $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};";

        }

        public void InitializeDatabase()
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    // Check if table exists
                    var checkTableQuery = @"
                        SELECT COUNT(*) 
                        FROM information_schema.tables 
                        WHERE table_schema = 'logiii' 
                        AND table_name = 'application_logs'";

                    bool tableExists = false;
                    using (var checkCommand = new MySqlCommand(checkTableQuery, connection))
                    {
                        var result = checkCommand.ExecuteScalar();
                        tableExists = Convert.ToInt32(result) > 0;
                    }

                    if (!tableExists)
                    {
                        Console.WriteLine("⚙️  Table 'application_logs' not found. Creating...");

                        // Create table
                        var createTableQuery = @"
                            CREATE TABLE IF NOT EXISTS application_logs (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                level VARCHAR(10) NOT NULL COMMENT 'Log level: INFO, ERROR, DEBUG, WARN',
                                message TEXT NOT NULL COMMENT 'Log message content',
                                source VARCHAR(50) NOT NULL COMMENT 'Source application',
                                timestamp DATETIME NOT NULL COMMENT 'When the log was created',
                                
                                INDEX idx_timestamp (timestamp),
                                INDEX idx_level (level),
                                INDEX idx_source (source)
                            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

                        using (var createCommand = new MySqlCommand(createTableQuery, connection))
                        {
                            createCommand.ExecuteNonQuery();
                        }

                        Console.WriteLine("✅ Table 'application_logs' created successfully!");
                    }
                    else
                    {
                        Console.WriteLine("✅ Table 'application_logs' already exists.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [CRITICAL] Failed to initialize database: {ex.Message}");
                Console.WriteLine("⚠️  Application will continue but logging to database may fail.");
                Console.WriteLine("💡 Tip: Ensure MySQL is running and credentials are correct.");
            }
        }
    }
}