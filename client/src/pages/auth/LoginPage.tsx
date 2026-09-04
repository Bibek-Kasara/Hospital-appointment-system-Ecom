import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError, selectAuthLoading, selectAuthError, selectIsAuthenticated, selectUserRole } from '../../store/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';

const schema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated && role) {
      const redirect = from || `/${role}/dashboard`;
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, role, navigate, from]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const onSubmit = (data: FormData) => {
    dispatch(login(data));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Heart className="mx-auto h-10 w-10 text-primary-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        {error && <Alert message={error} className="mb-4" onClose={() => dispatch(clearError())} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Register as Patient
          </Link>
        </p>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium">Demo credentials:</p>
          <p>Admin: admin@sahidhospital.gov.np / Admin@123</p>
          <p>Doctor: anil.rana@sahidhospital.gov.np / Doctor@123</p>
        </div>
      </Card>
    </div>
  );
}
