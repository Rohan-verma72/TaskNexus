using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TaskBackend.Data;
using TaskBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace TaskBackend.Services
{
    public class OverdueTaskNotificationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OverdueTaskNotificationService> _logger;

        public OverdueTaskNotificationService(IServiceProvider serviceProvider, ILogger<OverdueTaskNotificationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Overdue Notification Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndNotifyOverdueTasks();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in overdue notification service.");
                }

                // Run every 5 minutes
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task CheckAndNotifyOverdueTasks()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;
            var today = now.Date;

            // Find tasks that are overdue (due date is BEFORE today)
            var overdueTasks = await context.Tasks
                .Where(t => t.DueDate != null && t.DueDate < today && t.Status != TaskItemStatus.Completed && t.Status != TaskItemStatus.Overdue && t.AssigneeId != null)
                .ToListAsync();

            // Filter out tasks that already have a notification in-memory to avoid complex SQL translation issues
            var filteredOverdue = overdueTasks
                .Where(t => !context.Notifications.Any(n =>
                    n.UserId == t.AssigneeId &&
                    n.Message.Contains(t.Title) &&
                    n.CreatedAt > now.AddHours(-24)))
                .ToList();

            foreach (var task in filteredOverdue)
            {
                // Auto update task status to Overdue
                task.Status = TaskItemStatus.Overdue;

                // Create notification for assignee
                var notification = new Notification
                {
                    UserId    = task.AssigneeId!,
                    Message   = $"⚠️ Task \"{task.Title}\" is overdue! Please update it.",
                    IsRead    = false,
                    CreatedAt = now
                };
                context.Notifications.Add(notification);

                _logger.LogInformation($"Overdue notification created for task: {task.Title}");
            }

            if (overdueTasks.Count > 0)
                await context.SaveChangesAsync();
        }
    }
}
