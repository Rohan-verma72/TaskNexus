using System;

namespace TaskBackend.Models
{
    public class TimeLog
    {
        public int TimeLogId { get; set; }
        public Guid TaskId { get; set; }
        public TaskItem? Task { get; set; }
        
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        
        public decimal Hours { get; set; }
        public string Note { get; set; } = string.Empty;
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    }
}
