import { createElement, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { formatearFecha, parseYMD, toYMD } from './fechas';

type Props = {
  value: string;
  onChange: (ymd: string) => void;
};

export function SelectorFecha({ value, onChange }: Props) {
  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      style: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        fontFamily: 'inherit',
        backgroundColor: 'white',
      },
    });
  }

  return <SelectorFechaNativo value={value} onChange={onChange} />;
}

function SelectorFechaNativo({ value, onChange }: Props) {
  const [mostrarIOS, setMostrarIOS] = useState(false);
  const fecha = parseYMD(value);

  const manejarCambio = (_e: DateTimePickerEvent, seleccionada?: Date) => {
    setMostrarIOS(false);
    if (seleccionada) onChange(toYMD(seleccionada));
  };

  const abrir = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: fecha,
        mode: 'date',
        onChange: manejarCambio,
      });
    } else {
      setMostrarIOS(true);
    }
  };

  return (
    <View>
      <Pressable style={styles.boton} onPress={abrir}>
        <Text style={styles.texto}>{formatearFecha(value)}</Text>
      </Pressable>
      {mostrarIOS && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="inline"
          onChange={manejarCambio}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  boton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  texto: { fontSize: 15, color: '#333' },
});
