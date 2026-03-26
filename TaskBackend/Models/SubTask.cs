using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskBackend.Models
{
    public class SubTask
    {
        [Key]
        public int SubTaskId { get; set; }

        public Guid TaskId { get; set; }
        [JsonIgnore]
        public TaskItem? Task { get; set; }

        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
