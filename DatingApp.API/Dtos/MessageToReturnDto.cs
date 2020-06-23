using System;
using DatingApp.API.Models;

namespace DatingApp.API.Controllers
{
    internal class MessageToReturnDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }

        //these KnownAs properties named like this will help automapper map the same info
        public string SenderKnownAs { get; set; }
        public string SenderPhotoUrl { get; set; }
        public int RecipientId { get; set; }
        public string RecipientKnownAs { get; set; }
        public string RecipientPhotoUrl { get; set; }
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public DateTime? DateRead { get; set; }
        public DateTime MessageSent { get; set; }
    }
}