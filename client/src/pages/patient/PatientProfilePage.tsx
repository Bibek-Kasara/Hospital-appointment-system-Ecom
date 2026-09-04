import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { userApi } from '../../services';
import type { User } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset } = useForm<Partial<User>>();

  useEffect(() => {
    userApi.getMe().then(({ data }) => {
      if (data.success && data.data) reset(data.data);
    }).finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (formData: Partial<User>) => {
    setSaving(true);
    setError('');
    try {
      const { data } = await userApi.updateMe(formData);
      if (data.success) {
        setSuccess('Profile updated successfully');
        if (data.data) reset(data.data);
      }
    } catch {
      setError('Failed to update profile');
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
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
          <Input label="Full Name" {...register('full_name')} />
          <Input label="Email" disabled {...register('email')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Address" {...register('address')} />
          <Select
            label="Gender"
            options={[
              { value: '', label: 'Select' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            {...register('gender')}
          />
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
