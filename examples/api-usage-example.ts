// examples/api-usage-example.ts
// ตัวอย่างการใช้งาน API ใน Frontend

import { apiService } from '../constants/Api';
import { testMainConnection, findWorkingUrl, BASE_URL } from '../constants/ApiConfig';

// ===== ตัวอย่างการทดสอบการเชื่อมต่อ =====

/**
 * ทดสอบการเชื่อมต่อกับ Backend
 */
export const testBackendConnection = async () => {
  console.log('🔍 ทดสอบการเชื่อมต่อ Backend...');
  
  try {
    // ทดสอบการเชื่อมต่อหลัก
    const isConnected = await testMainConnection();
    
    if (isConnected) {
      console.log('✅ เชื่อมต่อ Backend สำเร็จ!');
      console.log('🌐 URL ที่ใช้:', BASE_URL);
      return true;
    } else {
      console.log('❌ ไม่สามารถเชื่อมต่อ Backend ได้');
      
      // ลองหา URL ที่ทำงานได้
      console.log('🔍 ลองหา URL ที่ทำงานได้...');
      const workingUrl = await findWorkingUrl();
      
      if (workingUrl) {
        console.log('🎯 พบ URL ที่ทำงานได้:', workingUrl);
        return true;
      } else {
        console.log('❌ ไม่พบ URL ที่ทำงานได้');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    return false;
  }
};

// ===== ตัวอย่างการใช้งาน API =====

/**
 * ดึงข้อมูลสินค้าทั้งหมด
 */
export const getAllProducts = async () => {
  try {
    console.log('📦 ดึงข้อมูลสินค้าทั้งหมด...');
    const products = await apiService.getProducts();
    console.log('✅ ได้ข้อมูลสินค้า:', products.length, 'รายการ');
    return products;
  } catch (error) {
    console.error('❌ ไม่สามารถดึงข้อมูลสินค้าได้:', error.message);
    throw error;
  }
};

/**
 * สร้างสินค้าใหม่
 */
export const createNewProduct = async (productData: {
  name: string;
  price: number;
  category: string;
  description?: string;
}) => {
  try {
    console.log('➕ สร้างสินค้าใหม่:', productData.name);
    const newProduct = await apiService.createProduct(productData);
    console.log('✅ สร้างสินค้าสำเร็จ:', newProduct);
    return newProduct;
  } catch (error) {
    console.error('❌ ไม่สามารถสร้างสินค้าได้:', error.message);
    throw error;
  }
};

/**
 * ดึงข้อมูลหมวดหมู่
 */
export const getAllCategories = async () => {
  try {
    console.log('📂 ดึงข้อมูลหมวดหมู่...');
    const categories = await apiService.getCategories();
    console.log('✅ ได้ข้อมูลหมวดหมู่:', categories.length, 'หมวดหมู่');
    return categories;
  } catch (error) {
    console.error('❌ ไม่สามารถดึงข้อมูลหมวดหมู่ได้:', error.message);
    throw error;
  }
};

// ===== ตัวอย่างการใช้งานใน Component =====

/**
 * ตัวอย่างการใช้งานใน React Component
 */
export const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // ทดสอบการเชื่อมต่อก่อน
      const isConnected = await testBackendConnection();
      
      if (!isConnected) {
        throw new Error('ไม่สามารถเชื่อมต่อ Backend ได้');
      }
      
      // ดึงข้อมูลสินค้า
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      setError(error.message);
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      const newProduct = await createNewProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct
  };
};

// ===== ตัวอย่างการใช้งานใน Screen =====

/**
 * ตัวอย่างการใช้งานใน Screen
 */
export const ProductScreenExample = () => {
  const { products, loading, error, fetchProducts, addProduct } = useProductData();

  useEffect(() => {
    // โหลดข้อมูลสินค้าเมื่อเปิดหน้าจอ
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    try {
      const newProduct = {
        name: 'สินค้าตัวอย่าง',
        price: 100,
        category: 'อาหาร',
        description: 'คำอธิบายสินค้า'
      };
      
      await addProduct(newProduct);
      console.log('✅ เพิ่มสินค้าสำเร็จ');
    } catch (error) {
      console.error('❌ ไม่สามารถเพิ่มสินค้าได้:', error.message);
    }
  };

  if (loading) {
    return <Text>🔄 กำลังโหลด...</Text>;
  }

  if (error) {
    return (
      <View>
        <Text>❌ เกิดข้อผิดพลาด: {error}</Text>
        <TouchableOpacity onPress={fetchProducts}>
          <Text>🔄 ลองใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text>📦 สินค้าทั้งหมด: {products.length} รายการ</Text>
      
      {products.map((product, index) => (
        <View key={index}>
          <Text>{product.name} - ฿{product.price}</Text>
          <Text>หมวดหมู่: {product.category}</Text>
        </View>
      ))}
      
      <TouchableOpacity onPress={handleAddProduct}>
        <Text>➕ เพิ่มสินค้าใหม่</Text>
      </TouchableOpacity>
    </View>
  );
};

// ===== ตัวอย่างการจัดการ Error =====

/**
 * จัดการ Error ที่อาจเกิดขึ้น
 */
export const handleApiError = (error: any) => {
  if (error.message.includes('Network request failed')) {
    console.log('🌐 ปัญหาเครือข่าย - ตรวจสอบการเชื่อมต่อ Wi-Fi');
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
  }
  
  if (error.message.includes('Connection refused')) {
    console.log('🚫 ปัญหาการเชื่อมต่อ - ตรวจสอบว่า Backend รันอยู่');
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่';
  }
  
  if (error.message.includes('CORS')) {
    console.log('🔒 ปัญหา CORS - ตรวจสอบการตั้งค่า Backend');
    return 'เกิดข้อผิดพลาดในการเข้าถึงข้อมูล กรุณาลองใหม่อีกครั้ง';
  }
  
  console.log('❌ ข้อผิดพลาดที่ไม่ทราบ:', error.message);
  return 'เกิดข้อผิดพลาดที่ไม่ทราบ กรุณาลองใหม่อีกครั้ง';
};

// ===== Export ทั้งหมด =====
export {
  testBackendConnection,
  getAllProducts,
  createNewProduct,
  getAllCategories,
  useProductData,
  ProductScreenExample,
  handleApiError
};

