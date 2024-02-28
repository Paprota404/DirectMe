"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PendingRequests = () => {
  const [errorMessage,setErrorMessage] = useState("");

  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjljNTQyYmVkLWVlOGEtNGZmZi05NjAwLTAxYTdjNmNlNTg3ZSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJQYXByb3RhIiwiZXhwIjoxNzA4OTUzMzI1LCJpc3MiOiJEaXJlY3RNZSIsImF1ZCI6IkRpcmVjdGVycyJ9.CvPKpRXE36TrbR2bqs64d8QH0opcKDb2manvP280Y-4";

  interface FriendRequestModel {
    id: number;
    request_sender_id: string;
    request_receiver_id: string;
    status: number;
    sender_username: string;
    created_at: Date;
  }

  const { data: pendingRequests, isError } = useQuery<
    FriendRequestModel[],
    Error
  >("pendingRequests", async () => {
    const response = await fetch(
      "http://localhost:5108/api/FriendRequest/pending",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch pending requests");
    }
    return response.json();
  });

  const queryClient = useQueryClient();

  const acceptFriendRequestMutation = useMutation(
    async (id: number) => {
      const response = await fetch(`http://localhost:5108/api/FriendRequest/accept/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const responseBody = await response.json();
      if (!response.ok) {
        setErrorMessage(responseBody.error || "Unable to accept friend request");
      }
    },
    {
      onSuccess: () =>{
        queryClient.invalidateQueries("pendingRequests");
      }
    }
  );

  const handleAcceptFriendRequest = async (id: number) => {
    try {
      await acceptFriendRequestMutation.mutateAsync(id);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="border-2 w-5/6 self-center mt-5">
        Pending requests: {pendingRequests?.length || 0}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4 text-2xl">
            Friend Requests: {pendingRequests?.length || 0}
          </DialogTitle>
          <ul>
            {pendingRequests ? (
              pendingRequests.map((request) => (
                <li className="text-xl justify-between flex" key={request.id}>
                  <div>Request From: {request.sender_username}</div>
                  <Button onClick={() =>handleAcceptFriendRequest(request.id)} className="bg-white h-8 text-black font-semibold">
                    Accept
                  </Button>
                </li>
              ))
            ) : (
              <p className="text-xl">No pending requests available</p>
            )}
            {isError && <h1>Failed to load Friend Requests</h1>}
            {errorMessage && <h1>{errorMessage}</h1>}
          </ul>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PendingRequests;