using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ModulePDF.Models
{
    public class ListFilePDFViewModels
    {
        /*public ListFilePDFViewModels()
        {
            ListFilePDF = new List<FilePDF>();
            FilePDF pdf1 = new FilePDF(1, "PDF1", "/pdf/FilePDF1.pdf");
            ListFilePDF.Add(pdf1);
            FilePDF pdf2 = new FilePDF(2, "PDF2", "/pdf/FilePDF2.pdf");
            ListFilePDF.Add(pdf2);
        }*/
        public IList<FilePDF> ListFilePDF { get; set; }

        public SqlConnection getConnect()
        {
            return new SqlConnection(@"Data Source = .\SQLEXPRESS;Initial Catalog = ModulePDF; Integrated Security = True");
        }

        public DataTable getData()
        {
            SqlDataAdapter sql = new SqlDataAdapter("select * from FilePDF", getConnect());

            DataSet s = new DataSet();
            DataTable t = new DataTable();
            return t;
        }
    }

    public class PDFDBContext : DbContext
    {
        public PDFDBContext() : base("name=PDFDBContext") {}
        public DbSet<FilePDF> filePDF { get; set; }
        public DbSet<Comments> comments { get; set; }
    }

    [Table("FilePDF")]
    public class FilePDF
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int IdFilePDF { get; set; }
        public string FileName { get; set; }
        public string PathFile { get; set; }
        public DateTime UpdateDate { get; set; }
        public string DeleteFlag { get; set; }

        public FilePDF() { }
        public FilePDF(int id, string name, string path)
        {
            IdFilePDF = id;
            FileName = name;
            PathFile = path;
        }
        /*static void Main(string[] a)
        {
            FilePDF f = new FilePDF(1, "a", "b");
            Console.WriteLine(f.FileName);
        }*/
    }

    public class FilePDFViewModels
    {
        public FilePDF FilePDF { get; set; }
        public IList<Comments> ListComments { get; set; }
    }

    [Table("Comments")]
    public class Comments
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int IdComment { get; set; }
        public string ContentCmt { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int PageNumber { get; set; }
        public int IdFilePDF { get; set; }
        public int IdUserCreate { get; set; }
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime UpdateDate { get; set; }
        public string DeleteFlag { get; set; }
    }
}