import { Boxes, Plus, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { money, numeric } from '@/lib/format';
import ProductForm from '@/components/forms/ProductForm';
import Notice from '@/components/Notice';
import EmptyRow from '@/components/ui/EmptyRow';
import PageHeading from '@/components/ui/PageHeading';
import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = { title: 'کالاها و خدمات' };

interface SearchParams { q?: string; error?: string; ok?: string }

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const query = (params.q ?? '').slice(0, 100);
  const editable = user.role !== 'SALES';
  const products = await db.product.findMany({
    where: query ? { OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { sku: { contains: query, mode: 'insensitive' } },
    ] } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return <>
    <PageHeading eyebrow="کاتالوگ محصولات" title="کالاها و خدمات"
      description="مدیریت قیمت فروش، بهای تمام‌شده و کد محصولات."
      action={<a href="#product-list" className="btn btn-outline"><Boxes size={18} /> مشاهده لیست</a>} />
    <Notice error={params.error} ok={params.ok} />
    {editable && <section className="panel">
      <SectionHeading title="ثبت کالای جدید" description="موجودی اولیه را از صفحه انبار وارد کنید." action={<Plus size={20} />} />
      <ProductForm />
    </section>}
    <section className="panel" id="product-list">
      <SectionHeading title="فهرست کالاها" description={`${products.length} مورد نمایش داده شده`}
        action={<form className="search" method="get">
          <Search size={17} /><input name="q" defaultValue={query} placeholder="نام یا کد کالا" /><button>جست‌وجو</button>
        </form>} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>کد کالا</th><th>محصول</th><th>قیمت فروش</th>{editable && <th>بهای تمام‌شده</th>}<th>موجودی</th>{editable && <th>ویرایش</th>}</tr></thead>
          <tbody>
            {products.map((product) => <tr key={product.id}>
              <td className="code">{product.sku}</td>
              <td><strong>{product.name}</strong><div className="table-sub">واحد: {product.unit}</div></td>
              <td>{money(product.priceToman)}</td>
              {editable && <td>{money(product.costToman)}</td>}
              <td><span className={`stock-pill${product.stock <= 3 ? ' stock-low' : ''}`}>{numeric(product.stock)} {product.unit}</span></td>
              {editable && <td><details className="edit-details"><summary>ویرایش</summary><ProductForm product={product} /></details></td>}
            </tr>)}
            {!products.length && <EmptyRow columns={editable ? 6 : 4} message="کالایی ثبت نشده است." />}
          </tbody>
        </table>
      </div>
    </section>
  </>;
}
