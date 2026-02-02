using Logger.Models;
using Logger.Services;
using Microsoft.AspNetCore.Mvc;

namespace Logger.Controllers
{
    [ApiController]
    [Route("/logs")]
    public class LogController : ControllerBase
    {
        private readonly DatabaseLoggerService _databaseLogger;

        public LogController(DatabaseLoggerService databaseLogger)
        {
            _databaseLogger = databaseLogger;
        }

        [HttpPost]
        public IActionResult CreateLog([FromBody] LogRequest request)
        {
            if (request == null)
            {
                return BadRequest("Log request is null");
            }

            _databaseLogger.WriteLog(request);
            return Ok(new { message = "Log saved successfully" });
        }
    }
}