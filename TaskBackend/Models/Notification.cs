using System;
using System.ComponentModel.DataAnnotations;

namespace TaskBackend.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string Type { get; set; } = "Info"; // Info, Warning, Error
        
        public bool IsRead { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
