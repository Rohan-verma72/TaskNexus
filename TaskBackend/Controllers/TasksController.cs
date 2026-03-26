using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskBackend.Data;
using TaskBackend.Models;
using TaskItemStatus = TaskBackend.Models.TaskItemStatus;
using TaskBackend.Services;

namespace TaskBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public TasksController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            return await _context.Tasks.Include(t => t.Assignee).Include(t => t.TimeLogs).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(Guid id)
        {
            var taskItem = await _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.TimeLogs)
                .FirstOrDefaultAsync(t => t.TaskId == id);
                
            if (taskItem == null) return NotFound();

            var history = await _context.TaskHistories
                .Where(h => h.TaskId == id)
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();
            
            // Return as an object with history if needed, or just the task
            // For simplicity, we can add a property to TaskItem if we use DTOs, 
            // but let's just return the task and handle history separately in frontend if needed.
            return taskItem;
        }

        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<TaskHistory>>> GetTaskHistory(Guid id)
        {
            return await _context.TaskHistories
                .Where(h => h.TaskId == id)
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();
        }

        [HttpGet("{id}/subtasks")]
        public async Task<ActionResult<IEnumerable<SubTask>>> GetSubTasks(Guid id)
        {
            return await _context.SubTasks
                .Where(s => s.TaskId == id)
                .OrderBy(s => s.CreatedAt)
                .ToListAsync();
        }

        public class CreateSubTaskDto 
        {
            public string Title { get; set; } = string.Empty;
        }

        [HttpPost("{id}/subtasks")]
        public async Task<ActionResult<SubTask>> PostSubTask(Guid id, [FromBody] CreateSubTaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound("Task not found");

            var subTask = new SubTask { TaskId = id, Title = dto.Title, CreatedAt = DateTime.UtcNow };
            _context.SubTasks.Add(subTask);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSubTasks), new { id = id }, subTask);
        }

        [HttpPatch("subtasks/{subTaskId}/toggle")]
        public async Task<IActionResult> ToggleSubTask(int subTaskId)
        {
            var subTask = await _context.SubTasks.FindAsync(subTaskId);
            if (subTask == null) return NotFound();
            subTask.IsCompleted = !subTask.IsCompleted;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        [HttpDelete("subtasks/{subTaskId}")]
        public async Task<IActionResult> DeleteSubTask(int subTaskId)
        {
            var subTask = await _context.SubTasks.FindAsync(subTaskId);
            if (subTask == null) return NotFound();
            _context.SubTasks.Remove(subTask);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/comments")]
        public async Task<ActionResult<IEnumerable<TaskComment>>> GetTaskComments(Guid id)
        {
            return await _context.TaskComments
                .Include(c => c.User)
                .Where(c => c.TaskId == id)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public class CreateCommentDto 
        {
            public string UserId { get; set; } = string.Empty;
            public string Text { get; set; } = string.Empty;
        }

        [HttpPost("{id}/comments")]
        public async Task<ActionResult<TaskComment>> PostTaskComment(Guid id, [FromBody] CreateCommentDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound("Task not found");

            var comment = new TaskComment
            {
                TaskId = id,
                UserId = dto.UserId,
                Text = dto.Text,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(dto.UserId);
            comment.User = user;

            return CreatedAtAction(nameof(GetTaskComments), new { id = id }, comment);
        }

        public class CreateTaskDto 
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public int Priority { get; set; } = 2;
            public int Status { get; set; } = 1;
            public string? AssigneeId { get; set; }
            public int? ProjectId { get; set; }
            public DateTime? DueDate { get; set; }
        }

        public class UpdateTaskDto
        {
            public Guid TaskId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public int Priority { get; set; } = 2;
            public int Status { get; set; } = 1;
            public string? AssigneeId { get; set; }
            public DateTime? DueDate { get; set; }
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> PostTask([FromBody] CreateTaskDto dto)
        {
            Console.WriteLine($"[PostTask] Received Title: {dto.Title}, ProjectId: {dto.ProjectId}, AssigneeId: {dto.AssigneeId}");
            var newTask = new TaskItem {
                Title = dto.Title,
                Description = dto.Description,
                Priority = (TaskPriority)dto.Priority,
                Status = (TaskItemStatus)dto.Status,
                AssigneeId = string.IsNullOrWhiteSpace(dto.AssigneeId) ? null : dto.AssigneeId,
                DueDate = dto.DueDate
            };
            if (dto.ProjectId.HasValue)
            {
                newTask.ProjectId = dto.ProjectId.Value;
            }
            else
            {
                var defaultProject = await _context.Projects.FirstOrDefaultAsync();
                if (defaultProject == null)
                {
                    defaultProject = new Project { Name = "Default Project", Description = "Auto-generated project" };
                    _context.Projects.Add(defaultProject);
                    await _context.SaveChangesAsync();
                }
                newTask.ProjectId = defaultProject.ProjectId;
            }
            newTask.TaskId = Guid.NewGuid();
            newTask.CreatedAt = DateTime.UtcNow;
            newTask.UpdatedAt = DateTime.UtcNow;
            
            _context.Tasks.Add(newTask);
            if (!string.IsNullOrEmpty(newTask.AssigneeId)) newTask.AssignedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Create notification for assignee
            if (!string.IsNullOrEmpty(newTask.AssigneeId))
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = newTask.AssigneeId,
                    Message = $"A new task '{newTask.Title}' has been assigned to you.",
                    Type = "Info",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();

                // Send Email Notification (Mock)
                var user = await _context.Users.FindAsync(newTask.AssigneeId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    await _emailService.SendEmailAsync(user.Email, "New Task Assigned", 
                        $"Task '{newTask.Title}' has been assigned to you. Status: {newTask.Status}");
                }
            }

            return CreatedAtAction(nameof(GetTask), new { id = newTask.TaskId }, newTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(Guid id, [FromBody] UpdateTaskDto taskUpdate)
        {
            if (id != taskUpdate.TaskId) return BadRequest();

            var taskToUpdate = await _context.Tasks.FindAsync(id);
            if (taskToUpdate == null) return NotFound();

            // Check if status changed to Overdue (4)
            var newStatus = (TaskItemStatus)taskUpdate.Status;
            if (newStatus == TaskItemStatus.Overdue && taskToUpdate.Status != TaskItemStatus.Overdue && !string.IsNullOrEmpty(taskUpdate.AssigneeId))
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = taskUpdate.AssigneeId,
                    Message = $"Task '{taskUpdate.Title}' is now Overdue!",
                    Type = "Warning",
                    CreatedAt = DateTime.UtcNow
                });
            }

            if (taskToUpdate.AssigneeId != taskUpdate.AssigneeId && !string.IsNullOrEmpty(taskUpdate.AssigneeId))
            {
                taskToUpdate.AssignedAt = DateTime.UtcNow;
                _context.Notifications.Add(new Notification
                {
                    UserId = taskUpdate.AssigneeId,
                    Message = $"Task '{taskUpdate.Title}' has been assigned to you.",
                    Type = "Info",
                    CreatedAt = DateTime.UtcNow
                });

                // Send Email Notification (Mock)
                var user = await _context.Users.FindAsync(taskUpdate.AssigneeId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    await _emailService.SendEmailAsync(user.Email, "New Task Assignment", 
                        $"The task '{taskUpdate.Title}' has been assigned to you. Status: {taskUpdate.Status}");
                }
            }

            if (newStatus == TaskItemStatus.Completed && taskToUpdate.Status != TaskItemStatus.Completed)
                taskToUpdate.CompletedAt = DateTime.UtcNow;

            taskToUpdate.Title = taskUpdate.Title;
            taskToUpdate.Description = taskUpdate.Description;
            taskToUpdate.Priority = (TaskPriority)taskUpdate.Priority;
            taskToUpdate.Status = newStatus;
            taskToUpdate.AssigneeId = taskUpdate.AssigneeId;
            taskToUpdate.DueDate = taskUpdate.DueDate;
            taskToUpdate.UpdatedAt = DateTime.UtcNow;

            try {
                await _context.SaveChangesAsync();
            } catch (DbUpdateConcurrencyException) {
                if (!TaskExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var taskToDelete = await _context.Tasks.FindAsync(id);
            if (taskToDelete == null) return NotFound();

            var history = await _context.TaskHistories.Where(h => h.TaskId == id).ToListAsync();
            _context.TaskHistories.RemoveRange(history);

            _context.Tasks.Remove(taskToDelete);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody] TaskItemStatus newStatus)
        {
            var taskItem = await _context.Tasks.FindAsync(id);
            if (taskItem == null) return NotFound();

            if (newStatus == TaskItemStatus.Completed && taskItem.Status != TaskItemStatus.Completed)
                taskItem.CompletedAt = DateTime.UtcNow;

            taskItem.Status = newStatus;
            taskItem.UpdatedAt = DateTime.UtcNow;
            
            _context.TaskHistories.Add(new TaskHistory
            {
                TaskId = id,
                ChangeType = "StatusUpdated",
                NewValue = newStatus.ToString(),
                ChangedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Notify on completion or significant status change
            if (!string.IsNullOrEmpty(taskItem.AssigneeId))
            {
                var user = await _context.Users.FindAsync(taskItem.AssigneeId);
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    if (newStatus == TaskItemStatus.Completed)
                    {
                        await _emailService.SendEmailAsync(user.Email, "Task Completed", 
                            $"Good job! Your task '{taskItem.Title}' is marked as Completed.");
                    }
                    else if (newStatus == TaskItemStatus.Overdue)
                    {
                        await _emailService.SendEmailAsync(user.Email, "Task Overdue!", 
                            $"Urgent: Task '{taskItem.Title}' is now marked as Overdue.");
                    }
                }
            }

            return NoContent();
        }

        private bool TaskExists(Guid id) => _context.Tasks.Any(e => e.TaskId == id);
    }
}
