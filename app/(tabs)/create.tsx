import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BulletListInput } from '@/components/BulletListInput';
import { DropdownSelector } from '@/components/DropdownSelector';
import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { usStateCities, usStates } from '@/data/usLocations';

export default function CreatePostScreen() {
  const [image, setImage] = useState('');
  const [state, setState] = useState<string>();
  const [city, setCity] = useState<string>();
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [rating, setRating] = useState<number | undefined>();
  const [price, setPrice] = useState('');

  const cityOptions = useMemo(() => (state ? usStateCities[state] : []), [state]);

  const onSubmit = () => {
    const payload = {
      image,
      state,
      city,
      description,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      pros,
      cons,
      rating,
      price: price ? Number(price) : undefined,
    };
    console.log('Create post payload:', payload);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <InputField
        label="Image Upload (jpg/jpeg URL placeholder)"
        value={image}
        onChangeText={setImage}
        placeholder="https://example.com/trip-image.jpg"
      />
      <DropdownSelector
        label="State"
        value={state}
        options={usStates}
        placeholder="Select state"
        onSelect={(value) => {
          setState(value);
          setCity(undefined);
        }}
      />
      <DropdownSelector
        label="City"
        value={city}
        options={cityOptions}
        placeholder={state ? 'Select city' : 'Select state first'}
        onSelect={setCity}
      />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Share your experience..."
        multiline
        numberOfLines={4}
        style={styles.multiline}
      />
      <InputField
        label="Trip Start Date"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
      />
      <InputField
        label="Trip End Date"
        value={endDate}
        onChangeText={setEndDate}
        placeholder="YYYY-MM-DD"
      />
      <BulletListInput label="Pros" items={pros} onChange={setPros} />
      <BulletListInput label="Cons" items={cons} onChange={setCons} />
      <DropdownSelector
        label="Rating"
        value={rating ? `${rating} / 5` : undefined}
        options={['1', '2', '3', '4', '5']}
        placeholder="Select rating"
        onSelect={(value) => setRating(Number(value))}
      />
      <InputField
        label="Price (optional)"
        value={price}
        onChangeText={setPrice}
        placeholder="0"
        keyboardType="numeric"
      />

      <Pressable style={styles.submitButton} onPress={onSubmit}>
        <Text style={styles.submitButtonText}>Submit Post</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 130,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
