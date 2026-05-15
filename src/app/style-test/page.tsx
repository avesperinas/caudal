import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { tx, layout, interactive, financeColor, amountSign } from "@/lib/styles";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";

// ─── Datos dummy ─────────────────────────────────────────────────────────────
const transactions = [
  { id: 1, label: "Supermercado Mercadona", category: "Alimentación", amount: -87.4, date: "Hoy" },
  { id: 2, label: "Nómina Abril", category: "Ingresos", amount: 2350.0, date: "Ayer" },
  { id: 3, label: "Netflix", category: "Suscripciones", amount: -17.99, date: "12 abr" },
  { id: 4, label: "Gasolina", category: "Transporte", amount: -55.2, date: "11 abr" },
  { id: 5, label: "Restaurante La Tasca", category: "Restaurantes", amount: -38.5, date: "10 abr" },
];

const stats = [
  { label: "Balance", value: "4.280 €", change: "+12%", positive: true },
  { label: "Gastos (mes)", value: "1.240 €", change: "-8%", positive: false },
  { label: "Ahorro", value: "620 €", change: "+5%", positive: true },
];

// ─── Componentes de muestra ───────────────────────────────────────────────────
function TransactionRow({ t }: { t: (typeof transactions)[0] }) {
  return (
    <div className={interactive.listRow}>
      <div className="flex items-center gap-3">
        <div className={interactive.categoryIcon}>{t.label[0]}</div>
        <div>
          <p className={tx.label}>{t.label}</p>
          <p className={tx.caption}>{t.category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(tx.amount, financeColor({ sign: amountSign(t.amount) }))}>
          {formatAmount(t.amount)}
        </p>
        <p className={tx.caption}>{t.date}</p>
      </div>
    </div>
  );
}

function StatCard({ s }: { s: (typeof stats)[0] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className={tx.secondary}>{s.label}</p>
        <p className={cn(tx.amountLarge, "mt-1")}>{s.value}</p>
        <Badge variant={s.positive ? "default" : "secondary"} className="mt-2 text-xs">
          {s.change}
        </Badge>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StyleTestPage() {
  return (
    <div className={cn(layout.page, layout.pageSections)}>

      {/* Header */}
      <div>
        <Badge variant="outline" className="mb-4">Style Test — solo desarrollo</Badge>
        <h1 className={tx.pageTitle}>Caudal</h1>
        <p className={tx.secondary}>Prueba visual de componentes y estilo</p>
      </div>

      <Separator />

      {/* ── Tipografía ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Tipografía</h2>
        <div className="space-y-2">
          <p className={cn(tx.pageTitle, "text-4xl")}>Heading 1 — Balance mensual</p>
          <p className={cn(tx.pageTitle, "text-2xl")}>Heading 2 — Movimientos recientes</p>
          <p className={tx.sectionTitle}>Heading 3 — Gastos por categoría</p>
          <p className={tx.body}>Texto base — Transferencia realizada con éxito el 14 de abril de 2026.</p>
          <p className={tx.secondary}>Texto secundario — Última sincronización hace 2 minutos.</p>
          <p className={tx.caption}>Texto pequeño — Ref. TRX-20260414-001</p>
          <p className={tx.amountLarge}>
            4.280,50 €{" "}
            <span className={cn(tx.body, "text-muted-foreground")}>EUR</span>
          </p>
        </div>
      </section>

      <Separator />

      {/* ── Colores ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Paleta de color</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Background", cls: "bg-background border" },
            { name: "Card", cls: "bg-card border" },
            { name: "Muted", cls: "bg-muted" },
            { name: "Primary", cls: "bg-primary" },
            { name: "Secondary", cls: "bg-secondary border" },
            { name: "Accent", cls: "bg-accent border" },
            { name: "Destructive", cls: "bg-destructive" },
            { name: "Emerald (ganancia)", cls: "bg-emerald-500" },
          ].map((c) => (
            <div key={c.name} className={cn("h-16 rounded-lg flex items-end p-2", c.cls)}>
              <span className={tx.caption}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Botones y badges ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Botones y badges</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Añadir gasto</Button>
          <Button variant="secondary">Ver todo</Button>
          <Button variant="outline">Exportar</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="destructive">Eliminar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Activo</Badge>
          <Badge variant="secondary">Pendiente</Badge>
          <Badge variant="outline">Alimentación</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">+12%</Badge>
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">-8%</Badge>
        </div>
      </section>

      <Separator />

      {/* ── Formulario ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Formulario</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Accede a tu panel de finanzas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full">Entrar</Button>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ── Stats ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Tarjetas de resumen</h2>
        <div className={layout.statsGrid}>
          {stats.map((s) => <StatCard key={s.label} s={s} />)}
        </div>
      </section>

      <Separator />

      {/* ── Transacciones ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Lista de transacciones</h2>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={tx.sectionTitle}>Movimientos recientes</CardTitle>
              <Button variant="ghost" size="sm" className={tx.caption}>Ver todo →</Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.map((t) => <TransactionRow key={t.id} t={t} />)}
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ── Layout preview ── */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Layout — sidebar + contenido</h2>
        <div className="border rounded-xl overflow-hidden flex h-80 text-sm">
          <aside className="w-48 bg-sidebar border-r flex flex-col p-3 gap-1">
            <div className={cn(tx.caption, "px-2 py-1.5 uppercase tracking-wide mb-2")}>Caudal</div>
            {["Inicio", "Gastos", "Compartidos", "Inversiones", "Ahorro", "Herramientas"].map((item, i) => (
              <div key={item} className={cn(
                "px-3 py-2 rounded-md cursor-pointer text-sm",
                i === 0
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}>
                {item}
              </div>
            ))}
          </aside>
          <main className="flex-1 bg-background p-4 overflow-auto">
            <p className={cn(tx.caption, "mb-3")}>Inicio / Resumen</p>
            <h3 className={cn(tx.sectionTitle, "mb-3")}>Hola, Demo</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-card border rounded-lg p-2">
                  <p className={tx.caption}>{s.label}</p>
                  <p className={cn(tx.amount, "text-sm font-semibold")}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border rounded-lg p-2">
              <p className={cn(tx.label, "text-xs mb-1")}>Movimientos recientes</p>
              {transactions.slice(0, 3).map((t) => (
                <div key={t.id} className="flex justify-between items-center py-1 text-xs border-b last:border-0">
                  <span className={cn(tx.caption, "truncate max-w-[120px]")}>{t.label}</span>
                  <span className={cn(tx.amount, "text-xs", financeColor({ sign: amountSign(t.amount) }))}>
                    {formatAmount(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </section>

      <div className="h-16" />
    </div>
  );
}
