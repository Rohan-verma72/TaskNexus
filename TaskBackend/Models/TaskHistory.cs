using System;
using System.ComponentModel.DataAnnotations;

namespace TaskBackend.Models
{
    public class TaskHistory
    {
        [Key]
        public int HistoryId { get; set; }
        public Guid TaskId { get; set; }
        public TaskItem? Task { get; set; }

        public string? ModifiedById { get; set; }
        public ApplicationUser? ModifiedBy { get; set; }

        public string ChangeType { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }
}
