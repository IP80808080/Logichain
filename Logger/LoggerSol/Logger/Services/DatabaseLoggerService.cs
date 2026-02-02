using Logger.Models;
using MySql.Data.MySqlClient;
using System;

namespace Logger.Services
{
    public class DatabaseLoggerService
    {
        private readonly string _connectionString;

        public DatabaseLoggerService()
        {
            // MySQL connection string - matches Spring Boot config
            _connectionString = "Server=localhost;Port=3306;Database=logiii;User=root;Password=root123;";
        }

        public void WriteLog(LogRequest log)
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    connection.Open();

                    var query = @"
                        INSERT INTO application_logs 
                        (level, message, source, timestamp) 
                        VALUES 
                        (@level, @message, @source, @timestamp)";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@level", log.Level ?? "INFO");
                        command.Parameters.AddWithValue("@message", log.Message ?? "");
                        command.Parameters.AddWithValue("@source", log.Source ?? "Unknown");
                        command.Parameters.AddWithValue("@timestamp", DateTime.Now);

                        command.ExecuteNonQuery();
                    }
                }

                Console.WriteLine($"✅ [DB] Log saved: [{log.Level}] {log.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [ERROR] Failed to save log to database: {ex.Message}");
                // Fallback to file if database fails
                FallbackToFile(log, ex);
            }
        }

        private void FallbackToFile(LogRequest log, Exception dbError)
        {
            try
            {
                var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");
                Directory.CreateDirectory(logDirectory);

                var logFile = Path.Combine(logDirectory, $"fallback-{DateTime.Now:yyyy-MM-dd}.txt");

                var logLine =
                    $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} " +
                    $"[{log.Level}] " +
                    $"[{log.Source}] " +
                    $"{log.Message} " +
                    $"(DB Error: {dbError.Message})";

                File.AppendAllText(logFile, logLine + Environment.NewLine);
                Console.WriteLine($"📄 [FALLBACK] Log saved to file: {logFile}");
            }
            catch (Exception fileEx)
            {
                Console.WriteLine($"🚨 [CRITICAL] Failed to write to file: {fileEx.Message}");
            }
        }
    }
}