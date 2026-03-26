using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskBackend.Data;
using TaskBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TaskBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TimeLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<IEnumerable<TimeLog>>> GetTaskTimeLogs(Guid taskId)
        {
            return await _context.TimeLogs
                .Where(t => t.TaskId == taskId)
                .Include(t => t.User)
                .OrderByDescending(t => t.LoggedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<TimeLog>> LogTime(TimeLog log)
        {
            log.LoggedAt = DateTime.UtcNow;
            _context.TimeLogs.Add(log);
            
            // Add a history entry for the task too
            _context.TaskHistories.Add(new TaskHistory {
                TaskId = log.TaskId,
                ChangeType = "TimeLogged",
                NewValue = $"{log.Hours} hours logged by {log.UserId}",
                ChangedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(log);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<decimal>> GetUserTotalTime(string userId)
        {
            var total = await _context.TimeLogs
                .Where(t => t.UserId == userId)
                .SumAsync(t => t.Hours);
            return Ok(total);
        }
    }
}
