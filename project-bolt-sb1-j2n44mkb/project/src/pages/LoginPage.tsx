import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext'; // Import AuthContext for authentication
import toast from 'react-hot-toast';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login, user } = useAuth(); // Get login function and user state from AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');

      // Redirect based on user role
      navigate(user?.isAdmin ? '/admin' : from, { replace: true });
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-50'>
      <div className='w-full max-w-md p-8 bg-white shadow-md rounded-lg'>
        <h2 className='text-2xl font-bold text-center mb-6 text-gray-900'>
          Sign in to your account
        </h2>
        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email address
            </label>
            <input
              id='email'
              type='email'
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className='w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300'
            />
            {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              id='password'
              type='password'
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className='w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300'
            />
            {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50'
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className='text-center mt-4 text-sm'>
          Don't have an account?{' '}
          <Link to='/register' className='text-blue-600 hover:underline'>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
