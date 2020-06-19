using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;
        public DatingRepository(DataContext context)
        {
            _context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            //Saving in memory NOT actually adding to database at this point
            _context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(p => p.Id == id);
            return photo;
        }

        public async Task<User> GetUser(int id)
        {
            //retrieve user by id including their photos. Returns null if not found
            var user = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == id);
            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            //return list of users from database including their photos as we will want to display their main photo
            var users = _context.Users.Include(p => p.Photos)
                        .OrderByDescending(u => u.LastActive) 
                        .AsQueryable(); //adding asqueryable allows us to use where below

            //filter out the particular user so they don't show up in the list
            users = users.Where(u => u.Id != userParams.UserId);

            //filter out so only opposite gender is being returned
            users = users.Where(u => u.Gender == userParams.Gender);

            //user has selected a filtered age range
            if (userParams.MinAge != 18 || userParams.MaxAge != 99) 
            {
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            //return the pagedList of users rather than all of the users
            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        public async Task<bool> SaveAll()
        {
            //if there are changes we will save > 0 changes and this will return true
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Photo> GetMainPhoto(int userId)
        {
            //get main photo for a particular userId
            return await _context.Photos.Where(u => u.UserId == userId).FirstOrDefaultAsync(p => p.IsMain);
        }
    }
}