using Requests.Models;
using Friends.Models;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Chat.Database;

namespace Requests.Services{

 public interface IFriendRequestService
    {
        void SendFriendRequest(int senderId, string receiverUsername);
        void AcceptFriendRequests(int requestId);
        List<FriendRequestModel> GetFriendRequests(int userId);
    }

public class FriendRequestService : IFriendRequestService{
     private readonly AppDbContext _dbContext;

     public FriendRequestService(AppDbContext dbContext){
        _dbContext = dbContext;
     }

     public void SendFriendRequest(int senderId, string receiverUsername){
        int? receiverId = _dbContext.users
        .Where(u => u.username == receiverUsername)
        .Select(u => (int?)u.id)
        .FirstOrDefault();

        if(receiverId == null){
            throw new Exception("User was not found");
        }

        if(senderId==receiverId.GetValueOrDefault()){
            throw new Exception("Can't send friend request to yourself");
        }
        
        if(_dbContext.friend_requests.Any(r => r.request_sender_id == senderId && r.request_receiver_id == receiverId)){
            var errorMessage = "Friend request already sent.";
            throw new Exception(errorMessage);
        }

        var friendRequest = new FriendRequestModel{
            request_sender_id = senderId,
            request_receiver_id = receiverId,
            status = FriendRequestStatus.Pending,
            created_at = DateTime.UtcNow
        };

        _dbContext.friend_requests.Add(friendRequest);
        _dbContext.SaveChanges();
    }

     public void AcceptFriendRequests(int requestId){
        var friendRequest = _dbContext.friend_requests.Find(requestId);

         if (friendRequest != null)
    {
        //Accepting friend request
        //Adding eachother to friends

        friendRequest.status = FriendRequestStatus.Accepted;

        var newFriendship = new FriendsModel{
            user1_id = friendRequest.request_sender_id,
            user2_id = friendRequest.request_receiver_id ?? 0
        };

        _dbContext.friends.Add(newFriendship);
        _dbContext.SaveChanges();
    };
     }

    public List<FriendRequestModel> GetFriendRequests(int userId)
    {
        return _dbContext.friend_requests.Where(fr => fr.request_receiver_id == userId && fr.status == FriendRequestStatus.Pending).ToList();
    }
}
}