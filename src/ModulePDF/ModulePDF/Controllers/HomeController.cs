using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using ModulePDF.Models;

namespace ModulePDF.Controllers
{
    public class HomeController : Controller
    {
        private PDFDBContext db = new PDFDBContext();
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult ListFilePDF()
        {
            var model = new ListFilePDFViewModels();

            var pdfFile = from e in db.filePDF where e.DeleteFlag == "0"
                          select e;
            model.ListFilePDF = pdfFile.ToList();

            return View(model);
        }

        public ActionResult FilePDFDetail(string id)
        {
            FilePDF pdfFile = null;
            try
            {
                int idFile = Int32.Parse(id);
                pdfFile = db.filePDF.Single(v => v.IdFilePDF == idFile);
            }
            catch (Exception)
            {
                return View("NotFound_404");
            }
            //var listComments = from c in db.comments where c.IdFilePDF == id && c.DeleteFlag == "0"
            //                   select c;
            var model = new FilePDFViewModels();
            model.FilePDF = pdfFile;
            //model.ListComments = listComments.ToList();

            return View(model);
        }
    }
}