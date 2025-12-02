// Avatar images utility for forum

export const getAuthorAvatar = (authorName: string): string => {
  const avatarMap: Record<string, string> = {
    'Admin': '/admin-interface.svg',
    'default': '/abstract-geometric-shapes.svg'
  };
  return avatarMap[authorName] || avatarMap['default'];
};

// Color options for forum categories
export const colorOptions = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'cyan', label: 'Cian', class: 'bg-cyan-500' },
];

export const getColorClass = (color: string): string => {
  const colorOption = colorOptions.find(c => c.value === color);
  return colorOption?.class || 'bg-blue-500';
};

// Category color mapping for sidebar display
export const getCategoryColor = (index: number): string => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
  return colors[index % colors.length];
};
