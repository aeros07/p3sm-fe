export const formatCategoryTreeData = (data) => {
  return data.map((item) => ({
    id: item.id,
    nama: `${item.name} `,
    children: item.children ? formatCategoryTreeData(item.children) : [],
  }));
};
