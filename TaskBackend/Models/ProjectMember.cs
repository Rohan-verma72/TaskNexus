using System;

namespace TaskBackend.Models
{
    public class ProjectMember
    {
        public int ProjectId { get; set; }
        public Project? Project { get; set; }
        
        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }
        
        public string Role { get; set; } = "Member";
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
