using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace TaskBackend.Models
{
    public enum TaskPriority { Low = 1, Medium = 2, High = 3 }
    public enum TaskItemStatus { Pending = 1, InProgress = 2, Completed = 3, Overdue = 4 }

    public class TaskItem
    {
        [Key]
        public Guid TaskId { get; set; }
        public int ProjectId { get; set; }
        public Project? Project { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;

        public string? AssigneeId { get; set; }
        public ApplicationUser? Assignee { get; set; }

        public string? CreatorId { get; set; }
        public ApplicationUser? Creator { get; set; }

        public DateTime? DueDate { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public System.Collections.Generic.ICollection<TimeLog>? TimeLogs { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public decimal TotalHours => TimeLogs?.Sum(t => t.Hours) ?? 0;
    }
}
