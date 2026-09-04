import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { userApi } from '../../services';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { getDoctorImage } from '../../utils';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/authSlice';

export default function DoctorProfilePage() {
  const user = useAppSelector(selectUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    userApi.getMe().then(({ data }) => {
      if (data.success && data.data) reset(data.data);
    }).finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      const { data } = await userApi.updateMe(formData);
      if (data.success) {
        setSuccess('Profile updated');
        if (data.data) reset(data.data);
      }
    } catch {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      {success && <Alert type="success" message={success} className="mt-4" onClose={() => setSuccess('')} />}
      {error && <Alert message={error} className="mt-4" />}
      <Card className="mt-6">
        {user && <img src={getDoctorImage(user)} alt="Profile" className="mb-4 h-20 w-20 rounded-full object-cover" />}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <Input label="Full Name" {...register('full_name')} />
          <Input label="Email" disabled {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Specialization" {...register('specialization')} />
          <Input label="Qualification" {...register('qualification')} />
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
