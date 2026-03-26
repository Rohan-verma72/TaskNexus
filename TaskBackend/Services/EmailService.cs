using System.Threading.Tasks;

namespace TaskBackend.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string message);
    }

    public class MockEmailService : IEmailService
    {
        public Task SendEmailAsync(string email, string subject, string message)
        {
            // For production, you'd integrate with SMTP, SendGrid, or Mailgun.
            // For now, we simulate the process and log it.
            System.Console.WriteLine("----------------------------------------------------------------");
            System.Console.WriteLine($"[EMAIL SENT TO: {email}]");
            System.Console.WriteLine($"[SUBJECT: {subject}]");
            System.Console.WriteLine($"[MESSAGE: {message}]");
            System.Console.WriteLine("----------------------------------------------------------------");
            return Task.CompletedTask;
        }
    }
}
