"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileAvatar from "@/components/profile/avatar";
import LatestOrders from "./LatestOrders";
import { motion } from "framer-motion";

const ProfileOverview = ({ user, onAvatarChange }) => {
  const [currentUser] = useState(user);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='grid grid-cols-1 mt-10 md:grid-cols-2 gap-6'
    >
      <motion.div variants={item}>
        <Card className='bg-lightBlack border-none'>
          <CardContent className='p-4 md:p-6'>
            <motion.div
              className='flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ProfileAvatar
                userId={currentUser.id}
                initialAvatarUrl={currentUser.user_metadata?.avatar_url}
              />
              <div className='flex flex-col space-y-4 text-center md:text-left'>
                <motion.div
                  className='flex flex-col md:flex-row md:items-baseline md:space-x-4'
                  variants={item}
                >
                  <h3 className='text-gray-400 mb-1'>Username:</h3>
                  <p className='text-lg md:text-xl text-white m-0'>
                    {currentUser.user_metadata.full_name || "Not set"}
                  </p>
                </motion.div>
                <motion.div
                  className='flex flex-col md:flex-row md:items-baseline md:space-x-4'
                  variants={item}
                >
                  <h3 className='text-gray-400 mb-1'>Joined:</h3>
                  <p className='text-lg md:text-xl text-white m-0'>
                    {new Date(currentUser.created_at).toLocaleString()}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className='bg-lightBlack border-none'>
          <CardContent className='p-4 md:p-6'>
            <motion.div className='space-y-4' variants={item}>
              <div>
                <h3 className='text-gray-400 mb-1'>Email</h3>
                <p className='text-lg md:text-xl text-white break-all'>
                  {currentUser.email}
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className='col-span-1 md:col-span-2 mt-8'>
        <motion.h2
          variants={item}
          className='text-xl md:text-2xl font-semibold mb-4'
        >
          Latest Orders
        </motion.h2>
        <Card className='bg-lightBlack border-none'>
          <CardContent className='p-4 md:p-6'>
            <LatestOrders userId={currentUser.id} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ProfileOverview.propTypes = {
//   user: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     email: PropTypes.string.isRequired,
//     created_at: PropTypes.string.isRequired,
//     user_metadata: PropTypes.shape({
//       avatar_url: PropTypes.string,
//       full_name: PropTypes.string,
//     }).isRequired,
//   }).isRequired,
//   onAvatarChange: PropTypes.func,
// };

// ProfileOverview.defaultProps = {
//   onAvatarChange: () => {},
// };

export default ProfileOverview;
