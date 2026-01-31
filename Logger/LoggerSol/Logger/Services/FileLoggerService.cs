using Logger.Models;

namespace Logger.Services
{
    public class FileLoggerService
    {
        private readonly string _logFilePath;
        private static readonly object _lockObj = new object(); 

        public FileLoggerService()
        {
            var logDirectory = Path.Combine(
                Directory.GetCurrentDirectory(),
                "Logs"
            );

            Directory.CreateDirectory(logDirectory); 

            _logFilePath = Path.Combine(
                logDirectory,
                "application-log.txt"
            );
        }

        public void WriteLog(LogRequest log)
        {
            var logLine =
                $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} " +
                $"[{log.Level}] " +
                $"[{log.Source}] " +
                $"{log.Message}";

            lock (_lockObj)
            {
                File.AppendAllText(_logFilePath, logLine + Environment.NewLine);
            }
        }
    }
}
