using System;
using System.Linq;
using System.Web.Mvc;
using ModulePDF.Models;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using iText.Kernel.Pdf.Canvas.Parser;
using System.Text;
using System.Collections.Generic;

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
                          orderby e.IdFilePDF descending
                          select e;
            var skip = 0;
            var offset = 10;
            model.ListFilePDF = pdfFile.Skip(skip).Take(offset).ToList();
            model.Offset = offset;
            model.PageNum = 1;
            int totalPage = CountTotal() / offset;
            int ext = CountTotal() % offset;
            model.PageTotal = ext > 0 ? totalPage + 1 : totalPage;
            model.OrderBy = "1";
            model.OrderType = "desc";

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

        public string ReadFile(string pdfPath)
        {
            var pageText = new StringBuilder();
            var source = System.AppDomain.CurrentDomain.BaseDirectory;
            using (PdfDocument pdfDocument = new PdfDocument(new PdfReader(source + pdfPath)))
            {
                var pageNumbers = pdfDocument.GetNumberOfPages();
                for (int i = 1; i <= pageNumbers; i++)
                {
                    LocationTextExtractionStrategy strategy = new LocationTextExtractionStrategy();
                    PdfCanvasProcessor parser = new PdfCanvasProcessor(strategy);
                    parser.ProcessPageContent(pdfDocument.GetPage(i));
                    pageText.Append(strategy.GetResultantText());
                }
            }
            return pageText.ToString();
        }

        [HttpPost]
        public ActionResult FindListFilePDF(ListFilePDFViewModels input)
        {
            var model = new ListFilePDFViewModels();

            var pdfFile = from e in PDFDb.FilePDFDbSet
                          where e.DeleteFlag == "0"
                          //&& input.FindName == null ? true : e.FileName.Contains(input.FindName)
                          select e;

            var skip = (input.PageNum - 1) * input.Offset;
            if (input.FindName == null || input.FindName.Trim() == "") { 
                if (input.OrderType == "asc")
                {
                    if (input.OrderBy == "1")
                        model.ListFilePDF = pdfFile.OrderBy(item => item.IdFilePDF).Skip(skip).Take(input.Offset).ToList();
                    else if (input.OrderBy == "2")
                        model.ListFilePDF = pdfFile.OrderBy(item => item.FileName).Skip(skip).Take(input.Offset).ToList();
                    else
                        model.ListFilePDF = pdfFile.OrderBy(item => item.UpdateDate).Skip(skip).Take(input.Offset).ToList();
                }
                else
                {
                    if (input.OrderBy == "1")
                        model.ListFilePDF = pdfFile.OrderByDescending(item => item.IdFilePDF).Skip(skip).Take(input.Offset).ToList();
                    else if (input.OrderBy == "2")
                        model.ListFilePDF = pdfFile.OrderByDescending(item => item.FileName).Skip(skip).Take(input.Offset).ToList();
                    else
                        model.ListFilePDF = pdfFile.OrderByDescending(item => item.UpdateDate).Skip(skip).Take(input.Offset).ToList();
                }
                int totalPage = CountTotal() / input.Offset;
                int ext = CountTotal() % input.Offset;
                model.PageTotal = ext > 0 ? totalPage + 1 : totalPage;
            }
            else
            {
                List<FilePDF> listPDF = new List<FilePDF>();
                foreach (FilePDF pdf in pdfFile.ToList())
                {
                    if (pdf.PathFile != null && pdf.PathFile.Trim() != "")
                    {
                        if (listPDF.Count <= input.PageNum * input.Offset) { 
                            string textFile = ReadFile(pdf.PathFile);
                            if (pdf.FileName.IndexOf(input.FindName, StringComparison.CurrentCultureIgnoreCase) != -1 
                                ||textFile.IndexOf(input.FindName, StringComparison.CurrentCultureIgnoreCase) != -1)
                            {
                                listPDF.Add(pdf);
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                }
                if (input.OrderType == "asc")
                {
                    if (input.OrderBy == "1")
                        model.ListFilePDF = listPDF.OrderBy(item => item.IdFilePDF).Skip(skip).Take(input.Offset).ToList();
                    else if (input.OrderBy == "2")
                        model.ListFilePDF = listPDF.OrderBy(item => item.FileName).Skip(skip).Take(input.Offset).ToList();
                    else
                        model.ListFilePDF = listPDF.OrderBy(item => item.UpdateDate).Skip(skip).Take(input.Offset).ToList();
                }
                else
                {
                    if (input.OrderBy == "1")
                        model.ListFilePDF = listPDF.OrderByDescending(item => item.IdFilePDF).Skip(skip).Take(input.Offset).ToList();
                    else if (input.OrderBy == "2")
                        model.ListFilePDF = listPDF.OrderByDescending(item => item.FileName).Skip(skip).Take(input.Offset).ToList();
                    else
                        model.ListFilePDF = listPDF.OrderByDescending(item => item.UpdateDate).Skip(skip).Take(input.Offset).ToList();
                }
 
                int totalPage = listPDF.Count / input.Offset;
                int ext = listPDF.Count % input.Offset;
                model.PageTotal = ext > 0 ? totalPage + 1 : totalPage;
            }

            model.Offset = input.Offset;
            model.PageNum = input.PageNum;
            
            model.OrderBy = input.OrderBy;
            model.OrderType = input.OrderType;
            model.FindName = input.FindName;

            return View("ListFilePDF",model);
        }

        private int CountTotal()
        {
            return PDFDb.FilePDFDbSet.Count(e => e.DeleteFlag == "0");
        }
    }
}