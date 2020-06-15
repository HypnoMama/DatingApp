using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;

        public PhotosController(IDatingRepository repo, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _cloudinaryConfig = cloudinaryConfig;
            _mapper = mapper;
            _repo = repo;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);

        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id) 
        {
            var photoFromRepo = await _repo.GetPhoto(id);

            var photo = _mapper.Map<PhotoForReturnDto>(photoFromRepo);
            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, 
            [FromForm]PhotoForCreationDto photoForCreationDto) 
        {
            //compare userId against route parameter of {userId} to see if they match
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            

            var userFromRepo = await _repo.GetUser(userId);

            var file = photoForCreationDto.File;
            //result from cloudinatry
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                //using disposes stream once completed
                using (var stream = file.OpenReadStream())
                {
                    //upload params for cloudinary
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        //transform image in case the photo is too long, will find the face and crop around that
                        Transformation = new Transformation()
                            .Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Url.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            //map photoForCreationDto(source) to Photo object(destination)
            var photo = _mapper.Map<Photo>(photoForCreationDto);

            //if this is the first photo the user is uploading, set it to the main photo
            if (!userFromRepo.Photos.Any(u => u.IsMain))
            {
                photo.IsMain = true;
            }
            //add photo to db
            userFromRepo.Photos.Add(photo);

            //save
            if (await _repo.SaveAll())
            {
                var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { userId = userId, id = photo.Id}, photoToReturn);
            }


            return BadRequest("Could not add the photo");
        }

        //Note to self -> this id variable MUST match the parameter in the function!!!
        [HttpPost("{photoId}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int photoId)
        {
            //compare userId against route parameter of {userId} to see if they match
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized("user ids do not match");
            }
            //check that the photo belongs to the user
            var user = await _repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == photoId))
            {
                return Unauthorized("photo does not belong to user" + photoId);
            }

            //get photo from repo, check if it is already Main photo
            var photoFromRepo = await _repo.GetPhoto(photoId);
            if (photoFromRepo.IsMain) 
            {
                return BadRequest("This is already the main photo");
            }
            //Get Main photo for user from repo
            var currentMainPhoto = await _repo.GetMainPhoto(userId);
            currentMainPhoto.IsMain = false;
            photoFromRepo.IsMain = true;
            if (await _repo.SaveAll()) 
            {
                return NoContent();
            }

            return BadRequest("Could not set photo to main");
        }

        [HttpDelete("{photoId}")]
        public async Task<IActionResult> DeletePhoto(int userId, int photoId) 
        {
//compare userId against route parameter of {userId} to see if they match
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized("user ids do not match");
            }
            //check that the photo belongs to the user
            var user = await _repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == photoId))
            {
                return Unauthorized("photo does not belong to user" + photoId);
            }

            var photoFromRepo = await _repo.GetPhoto(photoId);
            if (photoFromRepo.IsMain) 
            {
                return BadRequest("You cannot delete your main photo.");
            }

            if (photoFromRepo.PublicId != null) 
            {
                var deletionParams = new DeletionParams(photoFromRepo.PublicId);

                var deletionResult = _cloudinary.Destroy(deletionParams);

                if ( deletionResult.Result == "ok") {
                    _repo.Delete(photoFromRepo);
                }
            }

            if (photoFromRepo.PublicId == null)
            {
                _repo.Delete(photoFromRepo);
            }

            if (await _repo.SaveAll()) {
                return Ok();
            }

            return BadRequest("Photo could not be deleted");

        }
    }
}