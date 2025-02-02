import { Card, CardContent } from "@/components/ui/card";
import UpdatePasswordForm from "../security/UpdatePasswordForm";
import UpdateEmailForm from "../security/UpdateEmailForm";


const SecurityTab = ({ currentEmail }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
      <Card className='md:col-span-2 border-white'>
        <CardContent className='p-6 bg-[#0E0E0E] rounded-lg'>
          <h2 className='text-2xl font-semibold mb-6 text-white'>
            Update Email
          </h2>
          <UpdateEmailForm currentEmail={currentEmail} />
        </CardContent>
      </Card>

      <Card className='md:col-span-1 bg-gray-900 border-white'>
        <CardContent className='p-6 bg-[#0E0E0E] rounded-lg h-full flex flex-col'>
          <h2 className='text-2xl font-semibold mb-6 text-white'>
            Change Password
          </h2>
          <div className='flex-grow'>
            <UpdatePasswordForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
