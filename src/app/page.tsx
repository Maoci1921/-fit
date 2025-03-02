'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, PhotoIcon, VideoCameraIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WorkoutItem {
  id: string;
  name: string;
}

interface WorkoutDay {
  id: string;
  name: string;
  items: WorkoutItem[];
}

interface User {
  id: string;
  name: string;
  workoutDays: WorkoutDay[];
}

interface Media {
  id: string;
  userId: string;
  itemId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface DeleteConfirm {
  dayId: string;
  itemId: string;
  itemName: string;
}

interface DeleteMediaConfirm {
  id: string;
  type: 'image' | 'video';
}

// 添加密码验证模态框接口
interface PasswordModal {
  isOpen: boolean;
  password: string;
  error: string;
}

// 添加退出编辑模态框接口
interface ExitEditModal {
  isOpen: boolean;
  hasChanges: boolean;
}

// 添加 IndexedDB 初始化和操作函数
const initDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fitnessDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
    };
  });
};

const saveMediaToDB = async (mediaItem: Media) => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['media'], 'readwrite');
    const store = transaction.objectStore('media');
    const request = store.put(mediaItem);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllMediaFromDB = async () => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['media'], 'readonly');
    const store = transaction.objectStore('media');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteMediaFromDB = async (id: string) => {
  const db = await initDB() as IDBDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['media'], 'readwrite');
    const store = transaction.objectStore('media');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultUser = {
    id: '1',
    name: '用户1',
    workoutDays: [
      { id: '1', name: '星期一', items: [] },
      { id: '2', name: '星期二', items: [] },
      { id: '3', name: '星期三', items: [] },
      { id: '4', name: '星期四', items: [] },
      { id: '5', name: '星期五', items: [] },
      { id: '6', name: '星期六', items: [] },
      { id: '7', name: '星期日', items: [] },
    ],
  };

  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === 'undefined') return [defaultUser];
    const savedUsers = localStorage.getItem('fitness-users');
    return savedUsers ? JSON.parse(savedUsers) : [defaultUser];
  });

  const [selectedUser, setSelectedUser] = useState<string>(() => {
    if (typeof window === 'undefined') return '1';
    const savedSelectedUser = localStorage.getItem('fitness-selected-user');
    return savedSelectedUser || '1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('fitness-authenticated') === 'true';
  });

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingItem, setEditingItem] = useState<{ dayId: string; itemId: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ dayId: string; itemId: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedSelectedItem = localStorage.getItem('fitness-selected-item');
    return savedSelectedItem ? JSON.parse(savedSelectedItem) : null;
  });
  const [activeTab, setActiveTab] = useState<'video' | 'image'>(() => {
    if (typeof window === 'undefined') return 'video';
    const savedActiveTab = localStorage.getItem('fitness-active-tab');
    return (savedActiveTab as 'video' | 'image') || 'video';
  });
  const [media, setMedia] = useState<Media[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedMedia = localStorage.getItem('fitness-media');
    return savedMedia ? JSON.parse(savedMedia) : [];
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [deleteMediaConfirm, setDeleteMediaConfirm] = useState<DeleteMediaConfirm | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<PasswordModal>({
    isOpen: !isAuthenticated, // 如果未认证，显示密码模态框
    password: '',
    error: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, videos: Media[]) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // 如果滑动距离大于50像素，则触发切换
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 向左滑，播放下一个视频
        const nextIndex = (currentVideoIndex + 1) % videos.length;
        setCurrentVideoIndex(nextIndex);
      } else {
        // 向右滑，播放上一个视频
        const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
        setCurrentVideoIndex(prevIndex);
      }
    }
    setTouchStart(null);
  };

  // 修改媒体数据初始化
  useEffect(() => {
    getAllMediaFromDB().then((mediaData) => {
      setMedia(mediaData as Media[]);
    });
  }, []);

  // 删除原有的媒体数据 localStorage 保存
  useEffect(() => {
    localStorage.setItem('fitness-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('fitness-selected-user', selectedUser);
  }, [selectedUser]);

  // 添加 selectedItem 的保存
  useEffect(() => {
    if (selectedItem) {
      localStorage.setItem('fitness-selected-item', JSON.stringify(selectedItem));
    } else {
      localStorage.removeItem('fitness-selected-item');
    }
  }, [selectedItem]);

  // 添加 activeTab 的保存
  useEffect(() => {
    localStorage.setItem('fitness-active-tab', activeTab);
  }, [activeTab]);

  // 修改媒体删除函数
  const deleteMedia = async (id: string) => {
    await deleteMediaFromDB(id);
    setMedia(media.filter(m => m.id !== id));
    setDeleteMediaConfirm(null);
  };

  // 修改文件上传处理函数
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedItem) return;

    const filesToProcess = Array.from(files);

    try {
      for (const file of filesToProcess) {
        // 检查文件类型
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if ((activeTab === 'image' && !isImage) || (activeTab === 'video' && !isVideo)) {
          alert(`请选择正确的文件类型：${activeTab === 'image' ? '图片' : '视频'}`);
          return;
        }

        if (isImage) {
          const compressedDataUrl = await compressImage(file);
          const newMedia: Media = {
            id: Date.now().toString(),
            userId: selectedUser,
            itemId: selectedItem.itemId,
            type: 'image',
            url: compressedDataUrl,
            thumbnail: compressedDataUrl,
          };
          await saveMediaToDB(newMedia);
          setMedia(prev => [...prev, newMedia]);
        } else if (isVideo) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const newMedia: Media = {
              id: Date.now().toString(),
              userId: selectedUser,
              itemId: selectedItem.itemId,
              type: 'video',
              url: e.target?.result as string,
            };
            await saveMediaToDB(newMedia);
            setMedia(prev => [...prev, newMedia]);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error('处理文件时出错:', error);
      alert('处理文件时出错，请稍后重试');
    }
  };

  // 用户管理功能
  const addUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: `用户${users.length + 1}`,
      workoutDays: [
        { id: '1', name: '星期一', items: [] },
        { id: '2', name: '星期二', items: [] },
        { id: '3', name: '星期三', items: [] },
        { id: '4', name: '星期四', items: [] },
        { id: '5', name: '星期五', items: [] },
        { id: '6', name: '星期六', items: [] },
        { id: '7', name: '星期日', items: [] },
      ],
    };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    localStorage.setItem('fitness-users', JSON.stringify(newUsers));
  };

  const deleteUser = (userId: string) => {
    const newUsers = users.filter(user => user.id !== userId);
    setUsers(newUsers);
    localStorage.setItem('fitness-users', JSON.stringify(newUsers));
    
    // 如果删除的是当前选中的用户，切换到第一个用户
    if (selectedUser === userId) {
      setSelectedUser(newUsers[0].id);
      localStorage.setItem('fitness-selected-user', newUsers[0].id);
      // 清除选中的训练项目
      setSelectedItem(null);
      localStorage.removeItem('fitness-selected-item');
    }
    
    setDeleteUserConfirm(null);
  };

  const startEditingUser = (userId: string, name: string) => {
    setEditingUser(userId);
    setEditingName(name);
  };

  const saveUserEdit = () => {
    if (!editingUser) return;
    const newUsers = users.map(user => 
      user.id === editingUser ? { ...user, name: editingName } : user
    );
    setUsers(newUsers);
    localStorage.setItem('fitness-users', JSON.stringify(newUsers));
    setEditingUser(null);
    setEditingName('');
  };

  // 训练日管理功能
  const addWorkoutItem = (dayId: string) => {
    const newUsers = users.map(user => {
      if (user.id === selectedUser) {
        return {
          ...user,
          workoutDays: user.workoutDays.map(day => {
            if (day.id === dayId) {
              return {
                ...day,
                items: [...day.items, { id: Date.now().toString(), name: '项目名称' }],
              };
            }
            return day;
          }),
        };
      }
      return user;
    });
    setUsers(newUsers);
    localStorage.setItem('fitness-users', JSON.stringify(newUsers));
  };

  // 修改删除训练项目的函数
  const deleteWorkoutItem = (dayId: string, itemId: string) => {
    const newUsers = users.map(user => {
      if (user.id === selectedUser) {
        return {
          ...user,
          workoutDays: user.workoutDays.map(day => {
            if (day.id === dayId) {
              return {
                ...day,
                items: day.items.filter(item => item.id !== itemId),
              };
            }
            return day;
          }),
        };
      }
      return user;
    });
    setUsers(newUsers);
    localStorage.setItem('fitness-users', JSON.stringify(newUsers));
    
    // 如果删除的是当前选中的项目，清除选中状态
    if (selectedItem?.dayId === dayId && selectedItem?.itemId === itemId) {
      setSelectedItem(null);
      localStorage.removeItem('fitness-selected-item');
    }
    
    setDeleteConfirm(null);
  };

  // 媒体处理功能
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 最大尺寸限制
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 压缩图片质量
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const currentUser = users.find(user => user.id === selectedUser);

  const handleImageClick = (id: string) => {
    const imageIndex = media.findIndex(m => m.id === id);
    setCurrentImageIndex(imageIndex);
    setSelectedImage(media[imageIndex].url);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imageItems = media.filter(item => item.type === 'image');
    const currentIndex = imageItems.findIndex(item => item.url === selectedImage);
    const prevIndex = (currentIndex - 1 + imageItems.length) % imageItems.length;
    setSelectedImage(imageItems[prevIndex].url);
    setCurrentImageIndex(prevIndex);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imageItems = media.filter(item => item.type === 'image');
    const currentIndex = imageItems.findIndex(item => item.url === selectedImage);
    const nextIndex = (currentIndex + 1) % imageItems.length;
    setSelectedImage(imageItems[nextIndex].url);
    setCurrentImageIndex(nextIndex);
  };

  // 添加密码验证函数
  const verifyPassword = () => {
    if (passwordModal.password === '111222') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fitness-authenticated', 'true');
      setPasswordModal({ isOpen: false, password: '', error: '' });
    } else {
      setPasswordModal(prev => ({ ...prev, error: '密码错误' }));
    }
  };

  // 如果未认证，显示密码验证界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center font-['SF_Pro_SC','PingFang_SC','-apple-system','BlinkMacSystemFont','system-ui','Helvetica_Neue','Helvetica','Arial',sans-serif]">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-orange-600 to-amber-500 text-transparent bg-clip-text mb-8">健身计划</h1>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">请输入访问密码</h3>
          <input
            type="password"
            value={passwordModal.password}
            onChange={(e) => setPasswordModal(prev => ({ ...prev, password: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
            className="w-full px-4 py-2 text-sm bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-300 mb-2"
            placeholder="请输入密码"
            autoFocus
          />
          {passwordModal.error && (
            <p className="text-red-500 text-sm mb-4">{passwordModal.error}</p>
          )}
          <button
            onClick={verifyPassword}
            className="w-full px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
          >
            确认
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-100 to-amber-50 font-['SF_Pro_SC','PingFang_SC','-apple-system','BlinkMacSystemFont','system-ui','Helvetica_Neue','Helvetica','Arial',sans-serif]">
      {/* 顶部标题 */}
      <div className="px-8 py-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 shadow-lg sticky top-0 z-10 border-b border-orange-200">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-orange-600 to-amber-500 text-transparent bg-clip-text">健身计划</h1>
          </div>
          <div className="flex items-center gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`relative group`}
              >
                {editingUser === user.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveUserEdit}
                    onKeyDown={(e) => e.key === 'Enter' && saveUserEdit()}
                    className="px-5 py-2 text-sm bg-white border border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-300 shadow-sm"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setSelectedUser(user.id)}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 shadow-sm
                      ${selectedUser === user.id 
                        ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-500/20' 
                        : 'bg-orange-50 text-gray-700 hover:bg-orange-100'}`}
                  >
                    {user.name}
                  </button>
                )}
                {selectedUser === user.id && (
                  <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-lg">
                      <button
                        onClick={() => {
                          startEditingUser(user.id, user.name);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors"
                      >
                        <PencilIcon className="w-3.5 h-3.5 text-orange-600" />
                      </button>
                      {users.length > 1 && (
                        <button
                          onClick={() => {
                            setDeleteUserConfirm(user.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors"
                        >
                          <TrashIcon className="w-3.5 h-3.5 text-orange-600" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addUser}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-8 gap-8 max-w-7xl mx-auto w-full">
        {/* 左侧训练计划区域 */}
        <div className="w-1/2 overflow-auto rounded-3xl bg-white shadow-xl">
          {currentUser?.workoutDays.map((day) => (
            <div key={day.id} className="border-b border-orange-100 last:border-b-0">
              <div className="flex justify-between items-center px-8 py-5 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                <h3 className="text-lg font-medium text-gray-800">{day.name}</h3>
                <button
                  onClick={() => addWorkoutItem(day.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-orange-100 transition-all duration-300"
                >
                  <PlusIcon className="w-5 h-5 text-orange-600" />
                </button>
              </div>

              <div className="px-8 pb-5">
                <div className="mt-4">
                  {day.items.map((item) => (
                    <div key={item.id} 
                      className={`flex items-center justify-between py-3.5 px-5 rounded-2xl bg-white mb-2 last:mb-0 group hover:bg-orange-50 transition-all duration-300 border ${
                        selectedItem?.itemId === item.id ? 'border-orange-500' : 'border-orange-100'
                      } cursor-pointer`}
                      onClick={() => setSelectedItem({ dayId: day.id, itemId: item.id })}
                    >
                      {editingItem?.dayId === day.id && editingItem?.itemId === item.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => {
                            const newUsers = users.map(u => {
                              if (u.id === selectedUser) {
                                return {
                                  ...u,
                                  workoutDays: u.workoutDays.map(d => {
                                    if (d.id === day.id) {
                                      return {
                                        ...d,
                                        items: d.items.map(i => 
                                          i.id === item.id ? { ...i, name: editingName } : i
                                        ),
                                      };
                                    }
                                    return d;
                                  }),
                                };
                              }
                              return u;
                            });
                            setUsers(newUsers);
                            localStorage.setItem('fitness-users', JSON.stringify(newUsers));
                            setEditingItem(null);
                            setEditingName('');
                          }}
                          className="flex-1 px-4 py-2 text-sm bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-300"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-1 text-sm text-gray-700">{item.name}</span>
                      )}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({ dayId: day.id, itemId: item.id });
                            setEditingName(item.name);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4 text-orange-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ dayId: day.id, itemId: item.id, itemName: item.name });
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-orange-100 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4 text-orange-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 右侧媒体区域 */}
        <div className="w-1/2 rounded-3xl bg-white shadow-xl p-8">
          {selectedItem ? (
            <>
              <div className="mb-8 flex gap-4">
                <button
                  onClick={() => {
                    setActiveTab('video');
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
                >
                  <VideoCameraIcon className="w-5 h-5 mr-2" />
                  上传视频
                </button>
                <button
                  onClick={() => {
                    setActiveTab('image');
                    imageFileInputRef.current?.click();
                  }}
                  className="flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
                >
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  上传图片
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileUpload}
                  onClick={(e) => {
                    // 清除文件选择，这样可以重复选择同一个文件
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
                <input
                  type="file"
                  ref={imageFileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  onClick={(e) => {
                    // 清除文件选择，这样可以重复选择同一个文件
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
              </div>

              {/* 视频区域 */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">视频</h3>
                <div className="grid grid-cols-1 gap-4">
                  {(() => {
                    const videos = media.filter(
                      item => item.type === 'video' && 
                      item.userId === selectedUser && 
                      item.itemId === selectedItem.itemId
                    );
                    return videos.length > 0 ? (
                      <div
                        key={videos[currentVideoIndex].id}
                        className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={(e) => handleTouchEnd(e, videos)}
                      >
                        <video
                          src={videos[currentVideoIndex].url}
                          className="w-full h-full object-cover"
                          controls
                          controlsList="nodownload nopictureinpicture noplaybackrate"
                          muted
                          playsInline
                          disablePictureInPicture
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteMediaConfirm({ id: videos[currentVideoIndex].id, type: 'video' });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70"
                        >
                          <TrashIcon className="w-4 h-4 text-white" />
                        </button>
                        {videos.length > 1 && (
                          <>
                            <button
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                const prevIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
                                setCurrentVideoIndex(prevIndex);
                              }}
                            >
                              <ChevronLeftIcon className="w-6 h-6 text-white" />
                            </button>
                            <button
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIndex = (currentVideoIndex + 1) % videos.length;
                                setCurrentVideoIndex(nextIndex);
                              }}
                            >
                              <ChevronRightIcon className="w-6 h-6 text-white" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* 图片区域 */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">图片</h3>
                <div className="grid grid-cols-3 gap-4">
                  {media
                    .filter(item => item.type === 'image' && item.userId === selectedUser && item.itemId === selectedItem.itemId)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
                        onClick={() => handleImageClick(item.id)}
                      >
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteMediaConfirm({ id: item.id, type: item.type });
                          }}
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70"
                        >
                          <TrashIcon className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              请选择一个训练项目以查看或上传媒体内容
            </div>
          )}
        </div>
      </div>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] px-20">
            <img
              src={selectedImage}
              alt=""
              className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-2xl"
              loading="lazy"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-300"
              onClick={handlePrevImage}
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-300"
              onClick={handleNextImage}
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-8">
              确定要删除训练项目&quot;{deleteConfirm.itemName}&quot;吗？
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300"
              >
                取消
              </button>
              <button
                onClick={() => deleteWorkoutItem(deleteConfirm.dayId, deleteConfirm.itemId)}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 媒体删除确认模态框 */}
      {deleteMediaConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-8">
              确定要删除这{deleteMediaConfirm.type === 'image' ? '张图片' : '个视频'}吗？
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteMediaConfirm(null)}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300"
              >
                取消
              </button>
              <button
                onClick={() => deleteMedia(deleteMediaConfirm.id)}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户删除确认模态框 */}
      {deleteUserConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-8">
              确定要删除{users.find(u => u.id === deleteUserConfirm)?.name}吗？
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteUserConfirm(null)}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300"
              >
                取消
              </button>
              <button
                onClick={() => {
                  deleteUser(deleteUserConfirm);
                  setDeleteUserConfirm(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
