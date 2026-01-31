using Logger.Models;
using Logger.Services;
using Microsoft.AspNetCore.Mvc;

namespace Logger.Controllers
{
    [ApiController]
    [Route("/logs")]
    public class LogController : ControllerBase
    {
        private readonly FileLoggerService _fileLogger;

        public LogController()
        {
            _fileLogger = new FileLoggerService();
        }

        [HttpPost]
        public IActionResult CreateLog([FromBody] LogRequest request)
        {
            if (request == null)
            {
                return BadRequest("Log request is null");
            }

            _fileLogger.WriteLog(request);

            return Ok(new { message = "Log saved successfully" });
        }
    }
}
