using System;
using System.Linq;
using System.Web.Mvc;
using ModulePDF.Models;

namespace ModulePDF.Controllers
{
    public class HomeController : Controller
    {
        private PDFDBContext PDFDb = new PDFDBContext();

        public ActionResult ListFilePDF()
        {
            var model = new ListFilePDFViewModels();

            var pdfFile = from e in PDFDb.FilePDFDbSet
                          where e.DeleteFlag == "0"
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
                pdfFile = PDFDb.FilePDFDbSet.Single(v => v.IdFilePDF == idFile && v.DeleteFlag == "0");
            }
            catch (Exception)
            {
                return View("NotFound_404");
            }

            var model = new FilePDFViewModels();
            model.FilePDF = pdfFile;

            return View(model);
        }
    }
}