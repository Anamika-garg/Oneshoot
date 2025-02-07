"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Card, CardContent } from "@/components/ui/card";

import ProfileAvatar from "@/components/profile/avatar";
import LatestOrders from "./LatestOrders";

const ProfileOverview = ({ user, onAvatarChange }) => {
  const [currentUser, setCurrentUser] = useState(user);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
      <Card className='bg-lightBlack border-none'>
        <CardContent className='p-6'>
          <div className='space-y-4 flex items-start gap-6'>
            <div className='flex items-center space-x-4'>
              <ProfileAvatar
                userId={currentUser.id}
                initialAvatarUrl={currentUser.user_metadata?.avatar_url}
              />
            </div>
            <div className='flex flex-col space-y-4'>
              <div className='flex  items-baseline space-x-4'>
                <h3 className='text-gray-400 mb-1'>Username:</h3>
                <p className='text-xl text-white m-0'>
                  {currentUser.user_metadata.full_name || "Not set"}
                </p>
              </div>
              <div className='flex items-baseline space-x-4 '>
                <h3 className='text-gray-400 mb-1'>Joined:</h3>
                <p className='text-xl text-white m-0'>
                  {new Date(currentUser.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-lightBlack border-none'>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div>
              <h3 className='text-gray-400 mb-1'>Email</h3>
              <p className='text-xl text-white'>{currentUser.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='col-span-1 md:col-span-2 mt-8'>
        <h2 className='text-2xl font-semibold mb-4'>Latest Orders</h2>
        <Card className='bg-lightBlack border-none'>
          <CardContent className='p-6'>
            <LatestOrders userId={currentUser.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

ProfileOverview.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    user_metadata: PropTypes.shape({
      avatar_url: PropTypes.string, // Assuming avatar_url is a string path
      full_name: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onAvatarChange: PropTypes.func,
};

ProfileOverview.defaultProps = {
  onAvatarChange: () => {},
};

export default ProfileOverview;
