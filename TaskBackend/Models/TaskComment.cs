using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskBackend.Models
{
    public class TaskComment
    {
        [Key]
        public int CommentId { get; set; }

        public Guid TaskId { get; set; }
        [JsonIgnore]
        public TaskItem? Task { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public string Text { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
