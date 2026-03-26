using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskBackend.Data;
using TaskBackend.Models;

namespace TaskBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects
                .Include(p => p.Tasks)
                .ThenInclude(t => t.Assignee)
                .Include(p => p.ProjectMembers)
                .ThenInclude(m => m.User)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Tasks)
                .ThenInclude(t => t.Assignee)
                .Include(p => p.ProjectMembers)
                .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(p => p.ProjectId == id);
                
            if (project == null) return NotFound();
            return project;
        }

        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            project.CreatedAt = DateTime.UtcNow;
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProject), new { id = project.ProjectId }, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, [FromBody] Project projectUpdate)
        {
            if (id != projectUpdate.ProjectId) return BadRequest();

            var existing = await _context.Projects.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = projectUpdate.Name;
            existing.Description = projectUpdate.Description;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.ProjectId == id);
            if (project == null) return NotFound();

            if (project.Tasks.Any())
            {
                return BadRequest("Cannot delete project with active tasks.");
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpPost("{projectId}/members")]
        public async Task<IActionResult> AddMember(int projectId, [FromBody] ProjectMember member)
        {
            if (projectId != member.ProjectId) return BadRequest();
            _context.ProjectMembers.Add(member);
            await _context.SaveChangesAsync();
            return Ok(member);
        }

        private bool ProjectExists(int id) => _context.Projects.Any(e => e.ProjectId == id);
    }
}
