import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';
import { Spacing, BorderRadius } from '../src/theme/colors';
import type { ThemeColors } from '../src/theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FAQCategory = 'clientes' | 'vendedores' | 'generales';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_DATA: Record<FAQCategory, FAQItem[]> = {
  clientes: [
    {
      q: '¿Cómo funciona NEXXOS?',
      a: 'NEXXOS conecta a clientes que necesitan repuestos o servicios automotrices con vendedores (talleres, repuesteros, particulares verificados). Solo debes crear una solicitud con los detalles de lo que necesitas (vehículo, repuesto, ubicación). El sistema la envía a vendedores compatibles cercanos a ti. Ellos te responderán con ofertas. Tú eliges la mejor opción y coordinas directamente por el chat.',
    },
    {
      q: '¿Tengo que pagar algo por usar NEXXOS como cliente?',
      a: 'No. Actualmente NEXXOS es 100% gratuito para clientes. No cobramos comisiones por las solicitudes. En el futuro podrían existir planes de suscripción o comisiones, pero se te notificará con anticipación.',
    },
    {
      q: '¿Cómo me registro?',
      a: 'Debes ingresar tu nombre completo, cédula (formato V-12345678), correo electrónico válido (lo verificaremos con un código de 6 dígitos), teléfono y una contraseña segura. Aceptar los Términos y Condiciones y la Política de Privacidad.',
    },
    {
      q: '¿Necesito compartir mi ubicación?',
      a: 'Sí, es fundamental para que NEXXOS pueda mostrarte vendedores cercanos a ti. Te pediremos permiso explícito para acceder a tu ubicación en tiempo real. Puedes rechazarlo o desactivarlo después en ajustes, pero sin ubicación no podrás recibir ofertas de vendedores cercanos.',
    },
    {
      q: '¿Qué pasa si ningún vendedor responde a mi solicitud?',
      a: 'NEXXOS amplía automáticamente el radio de búsqueda (hasta 15 km) y reenvía tu solicitud a más vendedores si no recibes respuestas. Si aún así nadie responde, te sugerimos verificar que los datos de tu solicitud (marca, modelo, repuesto) sean correctos o ampliar el radio de búsqueda.',
    },
    {
      q: '¿NEXXOS se responsabiliza por la calidad de los repuestos o el servicio?',
      a: 'No. NEXXOS es una plataforma tecnológica de encuentro. No somos responsables por la calidad de los repuestos, por el cumplimiento del vendedor, ni por accidentes o robos durante la transacción física. Eres responsable de verificar al vendedor y acordar los términos de pago y entrega directamente con él.',
    },
    {
      q: '¿Cómo reporto un problema con un vendedor?',
      a: 'Puedes calificar al vendedor después de la transacción. Si el problema es grave (fraude, acoso, violencia), escríbenos a soporte@nexxos.com con los detalles y capturas. Investigaremos y podremos sancionar al vendedor (suspensión o inhabilitación).',
    },
    {
      q: '¿Puedo cancelar una solicitud?',
      a: 'Sí. Puedes cerrar la solicitud desde el detalle de la misma mientras esté en estado "Abierta" o "En Proceso". Una vez cerrada, los vendedores no podrán seguir respondiendo.',
    },
    {
      q: '¿Los vendedores están verificados?',
      a: 'Todos los vendedores deben pasar por un proceso de verificación de identidad (documento + verificación facial). Además, mostramos su reputación (calificaciones de otros clientes) y su tiempo de respuesta promedio para que puedas decidir con confianza.',
    },
    {
      q: '¿Cómo sé si un vendedor está cerca de mí?',
      a: 'En la lista de respuestas a tu solicitud, cada vendedor muestra la distancia aproximada desde tu ubicación actual. Puedes ordenar por cercanía.',
    },
  ],
  vendedores: [
    {
      q: '¿Cómo me registro como vendedor?',
      a: 'Completa el formulario de registro (nombre, cédula, correo, teléfono) y luego pasa por el proceso de verificación (paso 1): subir foto de tu documento de identidad y realizar una verificación facial (selfie). Luego completa los pasos 2 al 6: vehículos que manejas, repuestos que ofreces, ubicación de tu tienda, etc.',
    },
    {
      q: '¿Tengo que pagar algo por registrarme como vendedor?',
      a: 'Actualmente NEXXOS es 100% gratuito para vendedores. No cobramos suscripción ni comisiones. En el futuro podríamos ofrecer planes de suscripción (Pro, Business, Enterprise) con beneficios adicionales (más visibilidad, más solicitudes por mes, prioridad en algoritmo), pero se te notificará con anticipación.',
    },
    {
      q: '¿Qué beneficios tengo al vender en NEXXOS?',
      a: '• Recibes solicitudes de clientes reales cerca de tu negocio.\n• Acceso a un sistema de emparejamiento inteligente basado en ubicación, vehículo y repuesto.\n• Perfil de negocio con logo, horarios, reputación.\n• Chat en tiempo real con clientes.\n• Notificaciones push para no perderte ninguna oportunidad.',
    },
    {
      q: '¿Cómo recibo las solicitudes?',
      a: 'Cuando un cliente crea una solicitud compatible con los vehículos y repuestos que ofreces, NEXXOS te la envía. La verás en tu pantalla de "Solicitudes" y recibirás una notificación push. Tienes un tiempo límite para responder (actualmente 15 minutos). Si no respondes, la solicitud se cierra automáticamente para ti y pasa a otro vendedor.',
    },
    {
      q: '¿Puedo seleccionar las marcas y modelos de vehículos que manejo?',
      a: 'Sí. Durante el registro (paso 4) puedes seleccionar las marcas (agrupadas por origen: Americanas, Japonesas, Europeas, etc.) y luego los modelos específicos de cada marca. También puedes actualizar esta información en "Editar Negocio" cuando quieras.',
    },
    {
      q: '¿Cómo me califican los clientes?',
      a: 'Después de que un cliente cierra una solicitud, puede calificarte con 1 a 5 estrellas y dejar un comentario opcional. Tu calificación promedio y el número de reseñas se muestran en tu perfil público, lo que influye en tu prioridad en el algoritmo de emparejamiento.',
    },
    {
      q: '¿Qué pasa si un cliente no me paga o cancela?',
      a: 'NEXXOS no procesa pagos actualmente. El acuerdo de pago y entrega es directo entre tú y el cliente. Recomendamos acordar métodos de pago seguros y, si es posible, solicitar una seña o pago por adelantado. NEXXOS no se hace responsable por impagos o cancelaciones.',
    },
    {
      q: '¿Puedo eliminar mi cuenta de vendedor?',
      a: 'Sí. Puedes cerrar tu cuenta desde la sección "Perfil" → "Cerrar sesión" o "Eliminar cuenta". Ten en cuenta que esto eliminará tu perfil de vendedor, tu historial de ventas y tus datos de verificación (salvo los que debamos conservar por obligaciones legales).',
    },
    {
      q: '¿Cómo actualizo mi logo o información de mi tienda?',
      a: 'Ingresa a "Editar Negocio" desde tu perfil. Allí podrás cambiar tu logotipo (se recomienda PNG con fondo transparente), dirección, horarios, vehículos que manejas y repuestos que ofreces.',
    },
    {
      q: '¿NEXXOS verifica mi identidad realmente?',
      a: 'Sí. El proceso de verificación facial y de documento de identidad es obligatorio. Esto ayuda a generar confianza en la plataforma y a reducir cuentas falsas. Tus datos biométricos se procesan de forma segura y no se comparten públicamente.',
    },
  ],
  generales: [
    {
      q: '¿Olvidaste tu contraseña? ¿Cómo la recuperas?',
      a: 'En la pantalla de inicio de sesión, toca "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico registrado y recibirás un código de 6 dígitos. Ingresa el código, luego podrás establecer una nueva contraseña.',
    },
    {
      q: '¿Puedo usar NEXXOS desde una computadora (web)?',
      a: 'Por ahora, NEXXOS está disponible como aplicación móvil para Android (APK) e iOS (próximamente). No contamos con versión web, pero la estamos evaluando.',
    },
    {
      q: '¿Qué hago si la app no carga o se cierra?',
      a: 'Intenta cerrar la app y volver a abrirla, reiniciar tu teléfono o verificar que tengas conexión a internet. Si el problema persiste, contacta a soporte@nexxos.com indicando tu dispositivo, versión de la app y qué estabas haciendo.',
    },
    {
      q: '¿Cómo reporto un error técnico?',
      a: 'Escríbenos a soporte@nexxos.com con una captura de pantalla o video (si es posible). Cuanto más detalle nos des, más rápido podremos solucionarlo.',
    },
    {
      q: '¿NEXXOS está disponible en todo Venezuela?',
      a: 'Sí, cualquier persona en Venezuela con conexión a internet puede usar NEXXOS. Sin embargo, la efectividad del emparejamiento depende de que haya vendedores registrados en tu zona.',
    },
    {
      q: '¿Cómo elimino mi cuenta de NEXXOS?',
      a: 'Para eliminar tu cuenta, dirígete a Perfil → Configuración → Eliminar cuenta. Se te pedirá confirmar la acción. Una vez eliminada, se borrarán tus datos personales, solicitudes e historial de chat. Algunos datos podrían conservarse por obligaciones legales. Este proceso es irreversible.',
    },
    {
      q: '¿Qué son los puntos y niveles de cliente?',
      a: 'NEXXOS recompensa a los clientes activos con puntos por cada solicitud que completan y califican. Acumular puntos te permite subir de nivel (Bronce, Plata, Oro, Platino), lo que puede darte beneficios como mayor visibilidad de tus solicitudes y acceso a funciones exclusivas en el futuro.',
    },
  ],
};

const CATEGORY_LABELS: Record<FAQCategory, { label: string; icon: string }> = {
  clientes: { label: 'Clientes', icon: 'person-outline' },
  vendedores: { label: 'Vendedores', icon: 'storefront-outline' },
  generales: { label: 'Generales', icon: 'globe-outline' },
};

const CATEGORIES: FAQCategory[] = ['clientes', 'vendedores', 'generales'];

export default function FAQScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('clientes');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleQuestion = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleCategoryChange = useCallback((cat: FAQCategory) => {
    setActiveCategory(cat);
    setExpandedIndex(null);
  }, []);

  const items = FAQ_DATA[activeCategory] ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Preguntas Frecuentes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const info = CATEGORY_LABELS[cat];
          return (
            <Pressable
              key={cat}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleCategoryChange(cat)}
            >
              <Ionicons
                name={info?.icon as any}
                size={16}
                color={isActive ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {info?.label ?? cat}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* FAQ List */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {items.map((item, index) => {
          const isOpen = expandedIndex === index;
          return (
            <View key={`${activeCategory}-${index}`} style={styles.faqCard}>
              <Pressable
                style={styles.questionRow}
                onPress={() => toggleQuestion(index)}
              >
                <Text style={styles.questionText}>{item?.q ?? ''}</Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.primary}
                />
              </Pressable>
              {isOpen ? (
                <View style={styles.answerContainer}>
                  <View style={styles.answerDivider} />
                  <Text style={styles.answerText}>{item?.a ?? ''}</Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {/* Contact footer */}
        <View style={styles.contactCard}>
          <Ionicons name="mail-outline" size={24} color={colors.primary} />
          <Text style={styles.contactTitle}>¿No encontraste tu respuesta?</Text>
          <Text style={styles.contactText}>Escríbenos a soporte@nexxos.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: c.textPrimary,
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      gap: 8,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: BorderRadius.md,
      backgroundColor: c.backgroundSection,
      borderWidth: 1,
      borderColor: c.border,
    },
    tabActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textSecondary,
    },
    tabTextActive: {
      color: c.accent,
      fontWeight: '600',
    },
    scroll: {
      padding: Spacing.md,
      paddingBottom: 40,
    },
    faqCard: {
      backgroundColor: c.cardBg,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: Spacing.sm,
      overflow: 'hidden',
    },
    questionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    questionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
      lineHeight: 21,
    },
    answerContainer: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.md,
    },
    answerDivider: {
      height: 1,
      backgroundColor: c.border,
      marginBottom: Spacing.sm,
    },
    answerText: {
      fontSize: 14,
      color: c.textSubtitle ?? c.textSecondary,
      lineHeight: 22,
    },
    contactCard: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      marginTop: Spacing.md,
      gap: 8,
    },
    contactTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textPrimary,
    },
    contactText: {
      fontSize: 14,
      color: c.primary,
      fontWeight: '500',
    },
  });
