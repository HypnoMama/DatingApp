using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            _mapper = mapper;
            _repo = repo;
        }

        [HttpGet("{id}", Name="GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int id) 
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }
            var messageFromRepo = await _repo.GetMessage(id);

            if (messageFromRepo == null)
                return NotFound();

            return Ok(messageFromRepo);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesForUser(int userId, 
                [FromQuery]MessageParams messageParams) //fromQuery gets the params from the query string and also 
                    // allows an empty query string
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
                return Unauthorized();
           
            messageParams.UserId = userId;

            var messagesFromRepo = await _repo.GetMessagesForUser(messageParams);

            var messages = _mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            Response.AddPagination(messagesFromRepo.CurrentPage, 
                        messagesFromRepo.PageSize, messagesFromRepo.TotalCount, messagesFromRepo.TotalPages);
            
            return Ok(messages);
        }

        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int recipientId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
                return Unauthorized();
            
            var messagesFromRepo = await _repo.GetMessageThread(userId, recipientId);
            
            var messages = _mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);
            
            return Ok(messages);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, MessageForCreationDto messageForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }

            messageForCreationDto.SenderId = userId;
            var recipient = await _repo.GetUser(messageForCreationDto.RecipientId);
            if (recipient == null) 
                return BadRequest("Could not find user");

            var message = _mapper.Map<Message>(messageForCreationDto);

            var sender = await _repo.GetUser(userId);

            var messageToReturn = _mapper.Map<MessageToReturnDto>(message);

            messageToReturn.SenderKnownAs = sender.KnownAs;
            var currentMain = await _repo.GetMainPhoto(userId);
            messageToReturn.SenderPhotoUrl = currentMain.Url;

            _repo.Add(message);

            if (await _repo.SaveAll())
            {
                
                return CreatedAtRoute("GetMessage", new {userId, id=message.Id}, messageToReturn);          
            }

            throw new System.Exception("Creating the message failed on save");
              
        }

        [HttpPost("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int messageId, int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }
            var messageFromRepo = await _repo.GetMessage(messageId);
            if (messageFromRepo.SenderId == userId)
            {
                //delete from userId
                //change value of sender deleted to true
                messageFromRepo.SenderDeleted = true;
            }
            else if (messageFromRepo.RecipientId == userId)
            {
                  //change value of recipient deleted to true
                  messageFromRepo.RecipientDeleted = true;
            } 
            else 
            {
                return Unauthorized();
            }

            if (messageFromRepo.SenderDeleted && messageFromRepo.RecipientDeleted)
            {
                _repo.Delete(messageFromRepo);
            }
            if (await _repo.SaveAll())
                return NoContent();
            
            throw new System.Exception("Error deleting message");
        }
        
        [HttpPost("{messageId}/read")]
        public async Task<IActionResult> ReadMessage(int messageId, int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }
            var messageFromRepo = await _repo.GetMessage(messageId);

            if (messageFromRepo.RecipientId != userId)
            {
                return Unauthorized();
            }

            messageFromRepo.IsRead = true;
            messageFromRepo.DateRead = DateTime.Now;

            if (await _repo.SaveAll())
            {
                return NoContent();
            }

            return BadRequest("message could not be marked unread");
        }

    }
}