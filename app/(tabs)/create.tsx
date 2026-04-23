import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BulletListInput } from '@/components/BulletListInput';
import { DropdownSelector } from '@/components/DropdownSelector';
import { InputField } from '@/components/InputField';
import { colors } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCities, resetSubmit, submitReview } from '@/store/reviewsSlice';

export default function CreatePostScreen() {
  const dispatch = useAppDispatch();

  const cities = useAppSelector((s) => s.reviews.cities);
  const fetchCitiesStatus = useAppSelector((s) => s.reviews.fetchCitiesStatus);
  const submitStatus = useAppSelector((s) => s.reviews.submitStatus);
  const submitting = submitStatus === 'loading';

  const [selectedState, setSelectedState] = useState<string>();
  const [selectedCity, setSelectedCity] = useState<string>();
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [price, setPrice] = useState('');

  // Fetch cities from backend on first open (skip if already loaded)
  useEffect(() => {
    if (fetchCitiesStatus === 'idle') {
      void dispatch(fetchCities());
    }
  }, [dispatch, fetchCitiesStatus]);

  // Derive sorted unique state list from backend data
  const stateOptions = useMemo(
    () => [...new Set(cities.map((c) => c.state))].sort(),
    [cities],
  );

  // Derive city list for the selected state
  const cityOptions = useMemo(
    () =>
      cities
        .filter((c) => c.state === selectedState)
        .map((c) => c.city)
        .sort(),
    [cities, selectedState],
  );

  const onSubmit = async () => {
    if (!selectedState || !selectedCity) {
      Alert.alert('Missing location', 'Please select a state and city.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing description', 'Please add a description.');
      return;
    }

    const result = await dispatch(
      submitReview({
        username: 'traveler.jules',
        city_name: selectedCity,
        state_name: selectedState,
        rating: 5,
        description,
        pros,
        cons,
      }),
    );

    if (submitReview.fulfilled.match(result)) {
      Alert.alert('Posted', 'Your post was submitted.');
      setImage('');
      setSelectedState(undefined);
      setSelectedCity(undefined);
      setDescription('');
      setPros([]);
      setCons([]);
      setPrice('');
      dispatch(resetSubmit());
    } else {
      const msg = result.error.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Submit failed', msg);
      dispatch(resetSubmit());
    }
  };

  const citiesLoading = fetchCitiesStatus === 'loading' || fetchCitiesStatus === 'idle';

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
        value={selectedState}
        options={stateOptions}
        placeholder={citiesLoading ? 'Loading states…' : 'Select state'}
        onSelect={(value) => {
          setSelectedState(value);
          setSelectedCity(undefined);
        }}
      />

      <DropdownSelector
        label="City"
        value={selectedCity}
        options={cityOptions}
        placeholder={
          citiesLoading
            ? 'Loading cities…'
            : selectedState
            ? 'Select city'
            : 'Select state first'
        }
        onSelect={setSelectedCity}
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
      <BulletListInput label="Pros" items={pros} onChange={setPros} />
      <BulletListInput label="Cons" items={cons} onChange={setCons} />
      <InputField
        label="Price (optional)"
        value={price}
        onChangeText={setPrice}
        placeholder="0"
        keyboardType="numeric"
      />

      <Pressable
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={() => void onSubmit()}
        disabled={submitting}>
        <Text style={styles.submitButtonText}>
          {submitting ? 'Submitting…' : 'Submit Post'}
        </Text>
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
