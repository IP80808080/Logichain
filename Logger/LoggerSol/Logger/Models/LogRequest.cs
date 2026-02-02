namespace Logger.Models
{
    public class LogRequest
    {
        public string Level { get; set; }    // INFO, ERROR, DEBUG
        public string Message { get; set; }  // Actual log text
        public string Source { get; set; }   // SpringBoot-Backend
    }
}
