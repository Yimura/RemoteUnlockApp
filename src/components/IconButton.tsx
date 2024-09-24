import { TouchableHighlight } from "react-native";
import Icon from '@react-native-vector-icons/ionicons';

export default function IconButton({ name, size = 32, style, onPress, ...rest }: any) {
    return (
        <TouchableHighlight onPress={onPress}>
            <Icon name={name} size={size} style={style} {...rest} />
        </TouchableHighlight >
    );
}
