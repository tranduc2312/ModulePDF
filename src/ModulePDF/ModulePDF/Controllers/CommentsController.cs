using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using ModulePDF.Models;

namespace ModulePDF.Controllers
{
    public class CommentsController : ApiController
    {
        private PDFDBContext PDFDb = new PDFDBContext();

        // GET: api/Comments
        [Route("api/Comments/{id}/{pageNum}")]
        public IQueryable<Comments> Getcomments(int id, int pageNum)
        {
            return PDFDb.CommentDbSet.Where(v => v.IdFilePDF == id && v.DeleteFlag == "0" && v.PageNumber == pageNum);
        }

        // PUT: api/Comments/5
        [HttpPut]
        [ResponseType(typeof(void))]
        public IHttpActionResult PutComments(int id, Comments comments)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != comments.IdComment)
            {
                return BadRequest();
            }
            Comments commentsUpdate = PDFDb.CommentDbSet.Find(id);
            if (commentsUpdate == null || comments == null)
            {
                return NotFound();
            }
            if (comments.IdUserCreate != commentsUpdate.IdUserCreate)
            {
                return Unauthorized();
            }
            commentsUpdate.ContentCmt = comments.ContentCmt;
            commentsUpdate.UpdateDate = DateTime.Now;

            PDFDb.Entry(commentsUpdate).State = EntityState.Modified;
            try
            {
                PDFDb.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.OK);
        }

        // POST: api/Comments
        [HttpPost]
        [ResponseType(typeof(Comments))]
        public IHttpActionResult PostComments(Comments comments)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            comments.UpdateDate = DateTime.Now;
            PDFDb.CommentDbSet.Add(comments);
            PDFDb.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = comments.IdComment }, comments);
        }

        // DELETE: api/Comments/5
        [HttpDelete]
        [ResponseType(typeof(Comments))]
        public IHttpActionResult DeleteComments(int id, Comments comments)
        {
            Comments commentsUpdate = PDFDb.CommentDbSet.Find(id);
            if (commentsUpdate == null)
            {
                return NotFound();
            }
            if (comments.IdUserCreate != commentsUpdate.IdUserCreate)
            {
                return Unauthorized();
            }
            commentsUpdate.DeleteFlag = "1";
            commentsUpdate.UpdateDate = DateTime.Now;
            PDFDb.Entry(commentsUpdate).State = EntityState.Modified;
            try
            {
                PDFDb.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentsExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Ok(comments);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                PDFDb.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CommentsExists(int id)
        {
            return PDFDb.CommentDbSet.Count(e => e.IdComment == id) > 0;
        }
    }
}