using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TaskBackend.Data;
using TaskBackend.Models;
using TaskBackend.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString)
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IEmailService, MockEmailService>();
builder.Services.AddHostedService<OverdueTaskNotificationService>();
builder.WebHost.UseUrls("http://0.0.0.0:5129"); // Force IPv4/IPv6 listen to prevent localhost resolution issues

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "..", "frontend")),
    RequestPath = ""
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "..", "frontend")),
    RequestPath = ""
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try {
        // Automatically apply missing migrations or create tables
        context.Database.Migrate();
    } catch {
        // If EF migration fails due to out-of-sync schema, manually create missing tables
        try {
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TimeLogs' and xtype='U')
                CREATE TABLE TimeLogs (
                    TimeLogId int IDENTITY(1,1) PRIMARY KEY,
                    TaskId uniqueidentifier NOT NULL,
                    UserId nvarchar(450) NULL,
                    Hours decimal(18,2) NOT NULL,
                    Note nvarchar(max) NOT NULL DEFAULT '',
                    LoggedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
                    CONSTRAINT FK_TimeLogs_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(TaskId),
                    CONSTRAINT FK_TimeLogs_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
                );
            ");
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProjectMembers' and xtype='U')
                CREATE TABLE ProjectMembers (
                    ProjectId int NOT NULL,
                    UserId nvarchar(450) NOT NULL,
                    Role nvarchar(max) NOT NULL,
                    JoinedAt datetime2 NOT NULL,
                    PRIMARY KEY (ProjectId, UserId),
                    CONSTRAINT FK_ProjectMembers_Projects FOREIGN KEY (ProjectId) REFERENCES Projects(ProjectId),
                    CONSTRAINT FK_ProjectMembers_Users FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
                );
            ");
        } catch (Exception ex) {
            Console.WriteLine("Could not create TimeLogs/ProjectMembers table manually: " + ex.Message);
        }
    }

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await RoleInitializer.SeedRoles(roleManager);
}

app.Run();
