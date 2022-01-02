using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ModulePDF.Startup))]
namespace ModulePDF
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
