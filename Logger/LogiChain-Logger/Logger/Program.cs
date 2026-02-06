using Logger.Services;

namespace Logger
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // ✅ Register services as Singleton
            builder.Services.AddSingleton<DatabaseInitializationService>();
            builder.Services.AddSingleton<DatabaseLoggerService>();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Enable CORS for Spring Boot to call this logger
            app.UseCors(policy =>
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader()
            );

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            Console.WriteLine("===========================================");
            Console.WriteLine("🚀 .NET Logger Service Starting...");
            Console.WriteLine("===========================================");

            // ✅ AUTO-INITIALIZE DATABASE ON STARTUP
            try
            {
                var dbInit = app.Services.GetRequiredService<DatabaseInitializationService>();
                dbInit.InitializeDatabase();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Database initialization failed: {ex.Message}");
            }

            Console.WriteLine("===========================================");
            Console.WriteLine("📊 Logging to MySQL Database: logiii");
            Console.WriteLine("📡 Listening on port 5136");
            Console.WriteLine("🌐 Swagger UI: https://localhost:5136/swagger");
            Console.WriteLine("===========================================");

            app.Run();
        }
    }
}