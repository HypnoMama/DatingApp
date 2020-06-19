using System;
using System.Collections;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        public UsersController(IDatingRepository repo, IMapper mapper)
        {
            _mapper = mapper;
            _repo = repo;

        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _repo.GetUsers();
            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);
            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _repo.GetUser(id);
            //Type is the Destination, argument is the source.
            var userToReturn = _mapper.Map<UserForDetailedDto>(user);
            return Ok(userToReturn);
        }

        [HttpPost]
        public async Task<IActionResult> AddUser(User user)
        {
            _repo.Add(user);
            var save = await _repo.SaveAll();
            return Ok("User added");
        }

        [HttpPut("{id}")] 
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdate) {
            
            //check that user updating matches token that server is receiving
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }
            var userFromRepo = await _repo.GetUser(id);
            
            //map userForUpdate to userFromRepo so we can store it back 
            _mapper.Map(userForUpdate, userFromRepo);
            
            if (await _repo.SaveAll())
                return NoContent();
            
            throw new Exception($"Update user {id} failed on save!");
        }



    }
}