import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary">
            健身计划
          </Link>
          
          <div className="flex space-x-4">
            <Link href="/workouts" className="text-gray-600 hover:text-primary">
              训练计划
            </Link>
            <Link href="/exercises" className="text-gray-600 hover:text-primary">
              动作库
            </Link>
            <Link href="/progress" className="text-gray-600 hover:text-primary">
              进度追踪
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-primary">
              个人中心
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 